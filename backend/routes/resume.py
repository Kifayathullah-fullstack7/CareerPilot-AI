import os
from flask import Blueprint, request, jsonify
from database import get_connection
from werkzeug.utils import secure_filename

# Import our parser and analysis services
from services.resume_parser import parse_resume
from services.ats_score import calculate_ats_score
from services.job_match import calculate_job_matches
from services.youtube_recommender import get_youtube_recommendations

resume_bp = Blueprint("resume", __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
ALLOWED_EXTENSIONS = {"pdf", "docx"}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ==========================
# POST /upload
# ==========================
@resume_bp.route("/upload", methods=["POST"])
def upload_resume():
    if "resume" not in request.files:
        return jsonify({"success": False, "message": "No file uploaded"}), 400

    file = request.files["resume"]
    
    if file.filename == "":
        return jsonify({"success": False, "message": "No file selected"}), 400

    user_id = request.form.get("user_id")
    if not user_id:
        return jsonify({"success": False, "message": "User ID is required"}), 400

    # Validate file size (max 5MB)
    file.seek(0, os.SEEK_END)
    file_length = file.tell()
    file.seek(0)

    if file_length > 5 * 1024 * 1024:
        return jsonify({"success": False, "message": "Maximum file size is 5MB"}), 400

    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Only PDF and DOCX files are allowed"}), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    # Process and save the resume
    try:
        # 1. Parse resume text
        resume_text = parse_resume(save_path)
        
        # 2. Calculate ATS Score
        ats_score = calculate_ats_score(resume_text)
        
        # 3. Calculate Job Match & Missing Skills
        matches = calculate_job_matches(resume_text)
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # 4. Insert resume details into MySQL resumes table
        cursor.execute(
            """
            INSERT INTO resumes (user_id, resume_name, resume_text, ats_score)
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, filename, resume_text, ats_score)
        )
        resume_id = cursor.lastrowid
        
        # 5. Insert job matches (top 3 matches) into job_matches table
        for match in matches[:3]:
            missing_skills_str = ",".join(match["missing_skills"])
            suggestions_str = " | ".join(match["suggestions"])
            
            cursor.execute(
                """
                INSERT INTO job_matches (resume_id, job_description, match_percentage, missing_skills, suggestions)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (resume_id, match["job"], match["match"], missing_skills_str, suggestions_str)
            )
            
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Resume uploaded and analyzed successfully",
            "resume_id": resume_id
        })

    except Exception as e:
        if os.path.exists(save_path):
            os.remove(save_path)
        print("Error during resume upload and analysis:", e)
        return jsonify({"success": False, "message": "Failed to process and analyze resume"}), 500


# ==========================
# GET /resume/<id>
# ==========================
@resume_bp.route("/resume/<int:resume_id>", methods=["GET"])
def get_resume_analysis(resume_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Query resume details
        cursor.execute(
            """
            SELECT id, resume_name, ats_score, uploaded_at, resume_text
            FROM resumes
            WHERE id = %s
            """,
            (resume_id,)
        )
        resume = cursor.fetchone()
        
        if not resume:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": "Resume not found"}), 404
            
        # Format dates
        if resume["uploaded_at"]:
            resume["uploaded_at"] = resume["uploaded_at"].strftime("%Y-%m-%d %H:%M:%S")
            
        # Query job matches
        cursor.execute(
            """
            SELECT job_description as job, match_percentage as `match`, missing_skills, suggestions
            FROM job_matches
            WHERE resume_id = %s
            ORDER BY match_percentage DESC
            """,
            (resume_id,)
        )
        job_matches = cursor.fetchall()
        
        # Build skills found & missing skills, and youtube tutorials from top matched job
        skills_found = []
        learning_recs = []
        
        if job_matches:
            top_match = job_matches[0]
            # Convert comma separated missing skills into list
            missing_skills = [s.strip() for s in top_match["missing_skills"].split(",") if s.strip()]
            top_match["missing_skills"] = missing_skills
            
            # Format suggestions list from pipe separated string
            suggestions_list = [s.strip() for s in top_match["suggestions"].split("|") if s.strip()]
            top_match["suggestions"] = suggestions_list
            
            # Form other job matches lists as well
            for other_match in job_matches[1:]:
                other_match["missing_skills"] = [s.strip() for s in other_match["missing_skills"].split(",") if s.strip()]
                other_match["suggestions"] = [s.strip() for s in other_match["suggestions"].split("|") if s.strip()]
            
            # Get recommended tutorials
            learning_recs = get_youtube_recommendations(missing_skills)
            
            # Backport found skills based on matching against predefined list
            from services.job_match import PREDEFINED_JOBS
            # Find the job object in our predefined lists
            job_obj = next((j for j in PREDEFINED_JOBS if j["title"] == top_match["job"]), None)
            if job_obj:
                for skill in job_obj["skills"]:
                    if skill not in missing_skills:
                        skills_found.append(skill)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "resume": resume,
            "job_matches": job_matches,
            "skills_found": skills_found,
            "learning_recommendations": learning_recs
        })
        
    except Exception as e:
        print("Error fetching resume analysis:", e)
        return jsonify({"success": False, "message": "Database query error"}), 500


# ==========================
# GET /dashboard
# ==========================
@resume_bp.route("/dashboard", methods=["GET"])
def get_dashboard_resumes():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify([])
        
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT resume_name, ats_score as score, DATE(uploaded_at) as date
            FROM resumes
            WHERE user_id = %s
            ORDER BY uploaded_at DESC
            LIMIT 5
            """,
            (user_id,)
        )
        resumes = cursor.fetchall()
        
        for r in resumes:
            if r["date"]:
                r["date"] = r["date"].strftime("%Y-%m-%d")
            else:
                r["date"] = ""
                
        cursor.close()
        conn.close()
        return jsonify(resumes)
        
    except Exception as e:
        print("Error fetching dashboard resumes:", e)
        return jsonify([])


# ==========================
# GET /history
# ==========================
@resume_bp.route("/history", methods=["GET"])
def get_history_resumes():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify([])
        
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, resume_name, ats_score as score, DATE(uploaded_at) as date
            FROM resumes
            WHERE user_id = %s
            ORDER BY uploaded_at DESC
            """,
            (user_id,)
        )
        resumes = cursor.fetchall()
        
        for r in resumes:
            if r["date"]:
                r["date"] = r["date"].strftime("%b %d, %Y")
            else:
                r["date"] = ""
                
            # Fetch top job match for each resume
            cursor.execute(
                """
                SELECT job_description, match_percentage
                FROM job_matches
                WHERE resume_id = %s
                ORDER BY match_percentage DESC
                LIMIT 1
                """,
                (r["id"],)
            )
            top_match = cursor.fetchone()
            if top_match:
                r["job_match"] = f"{top_match['job_description']} ({top_match['match_percentage']}% Match)"
            else:
                r["job_match"] = "N/A"
                
        cursor.close()
        conn.close()
        return jsonify(resumes)
        
    except Exception as e:
        print("Error fetching history resumes:", e)
        return jsonify([])


# ==========================
# GET /profile
# ==========================
@resume_bp.route("/profile", methods=["GET"])
def get_profile_stats():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"success": False, "message": "User ID is required"}), 400
        
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Query user data
        cursor.execute(
            "SELECT full_name, email, created_at FROM users WHERE id = %s",
            (user_id,)
        )
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": "User not found"}), 404
            
        # Format created date
        if user["created_at"]:
            user_reg = user["created_at"].strftime("%B %Y")
        else:
            user_reg = "N/A"
            
        # Query total uploads
        cursor.execute(
            "SELECT COUNT(*) as count FROM resumes WHERE user_id = %s",
            (user_id,)
        )
        count_res = cursor.fetchone()
        total_uploads = count_res["count"] if count_res else 0
        
        # Query average score
        cursor.execute(
            "SELECT AVG(ats_score) as avg_score FROM resumes WHERE user_id = %s",
            (user_id,)
        )
        avg_res = cursor.fetchone()
        average_score = int(avg_res["avg_score"]) if (avg_res and avg_res["avg_score"] is not None) else 0
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "full_name": user["full_name"],
            "email": user["email"],
            "registered_at": user_reg,
            "total_uploads": total_uploads,
            "average_score": average_score
        })
        
    except Exception as e:
        print("Error fetching profile stats:", e)
        return jsonify({"success": False, "message": "Database query error"}), 500
