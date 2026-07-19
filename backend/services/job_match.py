import re

PREDEFINED_JOBS = [
    {
        "title": "Python Developer",
        "skills": ["Python", "Flask", "Django", "SQL", "Git", "Docker", "REST API", "AWS"],
        "keywords": ["python", "flask", "django", "sql", "git", "docker", "rest api", "aws", "backend", "developer", "postgresql", "mysql"]
    },
    {
        "title": "Frontend Developer",
        "skills": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "TailwindCSS", "Webpack", "Git"],
        "keywords": ["html", "css", "javascript", "react", "typescript", "tailwind", "git", "frontend", "webpack", "developer", "sass", "bootstrap"]
    },
    {
        "title": "Data Scientist",
        "skills": ["Python", "SQL", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Machine Learning"],
        "keywords": ["python", "sql", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "machine learning", "data scientist", "analysis", "statistics", "r"]
    },
    {
        "title": "DevOps Engineer",
        "skills": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Jenkins", "Git", "Terraform", "Cloud"],
        "keywords": ["linux", "docker", "kubernetes", "aws", "cicd", "jenkins", "git", "terraform", "cloud", "devops", "engineer", "ansible", "bash"]
    }
]

def calculate_job_matches(resume_text):
    if not resume_text or not resume_text.strip():
        # Fallback empty structure
        return [
            {
                "job": job["title"],
                "match": 0,
                "matching_skills": [],
                "missing_skills": job["skills"],
                "suggestions": [f"Add skills: {', '.join(job['skills'])}"]
            } for job in PREDEFINED_JOBS
        ]

    text_lower = resume_text.lower()
    matches = []
    
    for job in PREDEFINED_JOBS:
        matching_skills = []
        missing_skills = []
        
        for skill in job["skills"]:
            # Match word boundary or simple search
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            # For multi-word skills like REST API, check direct string search as well
            if re.search(pattern, text_lower) or skill.lower() in text_lower:
                matching_skills.append(skill)
            else:
                missing_skills.append(skill)
                
        # Calculate percentage based on matched skills, with a baseline from keyword count
        total_skills = len(job["skills"])
        skill_match_rate = (len(matching_skills) / total_skills) * 100 if total_skills > 0 else 0
        
        # Calculate general keyword presence to boost match if they have relevant terms
        keyword_hits = 0
        for kw in job["keywords"]:
            if kw in text_lower:
                keyword_hits += 1
        kw_rate = (keyword_hits / len(job["keywords"])) * 30
        
        # Combined score capped at 100, minimum of 10 if there is any text
        match_rate = int(min(100, skill_match_rate * 0.8 + kw_rate))
        if match_rate == 0 and len(matching_skills) > 0:
            match_rate = 25
        match_rate = max(10, match_rate)
        
        # Generate specific career advice suggestions
        suggestions = []
        if len(missing_skills) > 0:
            suggestions.append(f"Consider adding projects or work experience that demonstrate: {', '.join(missing_skills[:3])}.")
        if match_rate < 50:
            suggestions.append("Align your resume's summary/skills section closer to backend, database, or infrastructure roles.")
        elif match_rate < 80:
            suggestions.append("Integrate quantifiable metrics (e.g. 'reduced latency by 20%') for your technical stack.")
        else:
            suggestions.append("Your profile strongly matches this role. Ensure your portfolio shows active work in these tools.")
            
        matches.append({
            "job": job["title"],
            "match": match_rate,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "suggestions": suggestions
        })
        
    # Sort matches by highest match percentage first
    matches.sort(key=lambda x: x["match"], reverse=True)
    return matches
