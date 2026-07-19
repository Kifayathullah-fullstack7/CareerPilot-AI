import re

COMMON_SECTIONS = {
    "experience": [r"experience", r"work history", r"employment history", r"professional background"],
    "education": [r"education", r"academic background", r"degrees", r"qualification"],
    "skills": [r"skills", r"technical skills", r"core competencies", r"expertise", r"proficiencies"],
    "projects": [r"projects", r"academic projects", r"personal projects", r"key projects"],
    "summary": [r"summary", r"professional summary", r"about me", r"objective", r"profile"]
}

TECH_KEYWORDS = [
    "python", "javascript", "java", "sql", "git", "docker", "aws", "cloud",
    "html", "css", "react", "node", "linux", "agile", "api", "database",
    "django", "flask", "kubernetes", "typescript", "c++", "c#", "testing",
    "ci/cd", "rest", "nosql", "mongodb", "postgres", "mysql"
]

def calculate_ats_score(resume_text):
    if not resume_text or not resume_text.strip():
        return 0
        
    score = 0
    text_lower = resume_text.lower()
    
    # 1. Section Headings Check (Max 30 points)
    # We award 6 points for each standard section found
    sections_found = 0
    for section, patterns in COMMON_SECTIONS.items():
        found = False
        for pattern in patterns:
            if re.search(r'\b' + pattern + r'\b', text_lower):
                found = True
                break
        if found:
            sections_found += 1
            
    score += sections_found * 6
    
    # 2. Contact Information & Formatting Check (Max 30 points)
    # Email check (10 points)
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text_lower))
    if has_email:
        score += 10
        
    # Phone number check (10 points)
    has_phone = bool(re.search(r'\b(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b', text_lower))
    if has_phone:
        score += 10
        
    # Word count check (10 points)
    words = text_lower.split()
    word_count = len(words)
    if 150 <= word_count <= 1500:
        score += 10
    elif 100 <= word_count <= 2000:
        score += 5
        
    # 3. Technical Keywords Match (Max 40 points)
    # Check intersection of general tech keywords. Each matching keyword gets 4 points, max 40.
    keywords_found = 0
    for kw in TECH_KEYWORDS:
        if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
            keywords_found += 1
            
    score += min(keywords_found * 4, 40)
    
    # Ensure score is between 0 and 100
    return max(0, min(100, score))
