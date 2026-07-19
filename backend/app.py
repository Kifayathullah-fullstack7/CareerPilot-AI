from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.resume import resume_bp

app = Flask(__name__)

# Enable CORS
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(resume_bp)

@app.route("/")
def home():
    return "CareerPilot AI Backend Running"

if __name__ == "__main__":
    app.run(debug=True)