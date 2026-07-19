YOUTUBE_RESOURCES = {
    "Docker": {
        "title": "Docker Tutorial for Beginners by Programming with Mosh",
        "url": "https://www.youtube.com/watch?v=pTFZFxd4hOI"
    },
    "AWS": {
        "title": "AWS Certified Cloud Practitioner Course by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=3hLmDS179YE"
    },
    "Git": {
        "title": "Git and GitHub Tutorial for Beginners by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=RGOj5yH7evk"
    },
    "TypeScript": {
        "title": "TypeScript Course for Beginners by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=30LWjhZzg50"
    },
    "React": {
        "title": "React JS Full Course for Beginners by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=bMknfKXIFA8"
    },
    "Python": {
        "title": "Python for Beginners by Programming with Mosh",
        "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc"
    },
    "Flask": {
        "title": "Flask Course - Web Development with Python by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=Z1RJmh_OIXA"
    },
    "Django": {
        "title": "Django for Beginners Full Course by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=F5mRW0q-A0o"
    },
    "Kubernetes": {
        "title": "Kubernetes Course for Beginners by TechWorld with Nana",
        "url": "https://www.youtube.com/watch?v=X48VuDVv0do"
    },
    "Terraform": {
        "title": "Terraform Course - HashiCorp Certified Associate by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=SLB_c_ayRkc"
    },
    "SQL": {
        "title": "SQL Tutorial for Beginners by Programming with Mosh",
        "url": "https://www.youtube.com/watch?v=7S_tz1z_5bA"
    },
    "JavaScript": {
        "title": "JavaScript Tutorial for Beginners by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=PkZNo7MFNFg"
    },
    "HTML": {
        "title": "HTML and CSS Full Course by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=mJgBOIoGihA"
    },
    "CSS": {
        "title": "CSS Tutorial for Beginners by Programming with Mosh",
        "url": "https://www.youtube.com/watch?v=1Rs2ND1ryYc"
    },
    "TailwindCSS": {
        "title": "Tailwind CSS Full Course for Beginners by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=lCxcTsOHr54"
    },
    "Webpack": {
        "title": "Webpack Beginner Tutorial by Web Dev Simplified",
        "url": "https://www.youtube.com/watch?v=MpGLCBEX_Og"
    },
    "Pandas": {
        "title": "Pandas Tutorial (Data Analysis with Python) by Keith Galli",
        "url": "https://www.youtube.com/watch?v=vmEHCJof1kU"
    },
    "NumPy": {
        "title": "NumPy Tutorial - Python Data Science Course by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=QUT1VHiLgI4"
    },
    "Scikit-learn": {
        "title": "Machine Learning with Scikit-Learn Full Tutorial by Python Programmer",
        "url": "https://www.youtube.com/watch?v=M9ItAMUjT1U"
    },
    "TensorFlow": {
        "title": "TensorFlow 2.0 Complete Course by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=tPYj3fFJGjk"
    },
    "PyTorch": {
        "title": "PyTorch for Beginners Full Course by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=V_xro1bcAuA"
    },
    "Machine Learning": {
        "title": "Machine Learning for Beginners Course by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=i_LwzRVP7bg"
    },
    "Linux": {
        "title": "Linux Operating System Tutorial for Beginners by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=wBp0Rb-ZJak"
    },
    "CI/CD": {
        "title": "DevOps CI/CD Tutorial for Beginners by freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=scEDHsr3APg"
    },
    "Jenkins": {
        "title": "Jenkins Tutorial for Beginners by TechWorld with Nana",
        "url": "https://www.youtube.com/watch?v=LFDrDnKP_gA"
    },
    "REST API": {
        "title": "What is a REST API? Explained by Codecademy",
        "url": "https://www.youtube.com/watch?v=LsChNLOwKz0"
    }
}

def get_youtube_recommendations(missing_skills):
    recommendations = []
    for skill in missing_skills:
        if skill in YOUTUBE_RESOURCES:
            recommendations.append({
                "skill": skill,
                "title": YOUTUBE_RESOURCES[skill]["title"],
                "url": YOUTUBE_RESOURCES[skill]["url"]
            })
        else:
            # Generate fallback YouTube search link
            query = f"{skill} tutorial for beginners"
            search_url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
            recommendations.append({
                "skill": skill,
                "title": f"Learn {skill} (YouTube Tutorial Search)",
                "url": search_url
            })
    return recommendations
