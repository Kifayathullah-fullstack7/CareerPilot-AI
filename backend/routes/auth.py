from flask import Blueprint, request, jsonify
from database import get_connection
import hashlib

auth_bp = Blueprint("auth", __name__)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    full_name = data["full_name"]
    email = data["email"]
    password = hash_password(data["password"])

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email=%s",
        (email,)
    )

    if cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({
            "success": False,
            "message": "Email already exists"
        })

    cursor.execute(
        """
        INSERT INTO users(full_name,email,password)
        VALUES(%s,%s,%s)
        """,
        (full_name, email, password)
    )

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Registration Successful"
    })


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data["email"]
    password = hash_password(data["password"])

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT * FROM users
        WHERE email=%s AND password=%s
        """,
        (email, password)
    )

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user:
        return jsonify({
            "success": True,
            "message": "Login Successful",
            "user": {
                "id": user["id"],
                "full_name": user["full_name"],
                "email": user["email"]
            }
        })

    return jsonify({
        "success": False,
        "message": "Invalid Email or Password"
    })

@auth_bp.route("/google-login", methods=["POST"])
def google_login():
    data = request.get_json()
    if not data or "email" not in data or "full_name" not in data:
        return jsonify({
            "success": False,
            "message": "Missing Google account data"
        }), 400

    email = data["email"]
    full_name = data["full_name"]

    conn = get_connection()
    cursor = conn.cursor()

    # Check if user already exists
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        # Create user with a dummy secure password
        import secrets
        import hashlib
        dummy_password = secrets.token_hex(16)
        hashed_password = hashlib.sha256(dummy_password.encode()).hexdigest()

        cursor.execute(
            """
            INSERT INTO users(full_name, email, password)
            VALUES(%s, %s, %s)
            """,
            (full_name, email, hashed_password)
        )
        conn.commit()

        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Google Login Successful",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"]
        }
    })