document.addEventListener("DOMContentLoaded", () => {
    loadResult();
    
    const downloadBtn = document.getElementById("download-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", downloadPDF);
    }
});

async function loadResult() {
    const params = new URLSearchParams(window.location.search);
    let resumeId = params.get("id");
    if (!resumeId) {
        resumeId = localStorage.getItem("last_resume_id");
    }

    if (!resumeId) {
        toast("No analysis found. Redirecting to upload...", "error");
        setTimeout(() => {
            window.location.href = "upload.html";
        }, 2000);
        return;
    }

    showLoader();

    try {
        const response = await fetch(`${API_BASE_URL}/resume/${resumeId}`);
        if (!response.ok) {
            throw new Error("Unable to fetch resume analysis results.");
        }

        const data = await response.json();
        hideLoader();

        if (data.success) {
            populateUI(data);
        } else {
            toast(data.message || "Failed to load results.", "error");
        }
    } catch (error) {
        hideLoader();
        console.error(error);
        toast("Server Connection Failed", "error");
    }
}

function populateUI(data) {
    const score = data.resume.ats_score;

    // 1. Set Circular Progress
    const circle = document.querySelector(".circular-progress circle");
    const scorePct = document.getElementById("ats-score-pct");
    const statusText = document.getElementById("ats-status");

    scorePct.textContent = `${score}%`;
    
    // Circumference is 2 * pi * r = 2 * 3.14159 * 65 = 408.4 => round to 408
    const circumference = 408;
    const offset = circumference - (score / 100) * circumference;
    
    // Small timeout to allow transition animation
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);

    // Score status label
    if (score >= 80) {
        statusText.textContent = "Excellent Compatibility!";
        statusText.className = "status-good";
    } else if (score >= 50) {
        statusText.textContent = "Moderate Compatibility!";
        statusText.className = "status-warning";
    } else {
        statusText.textContent = "Needs Improvement!";
        statusText.className = "status-bad";
    }

    // 2. Set Job Match Rate
    const matchCard = document.querySelector(".match-card");
    // Clear and keep header
    matchCard.innerHTML = "<h3>Job Match Rate</h3>";
    
    if (data.job_matches && data.job_matches.length > 0) {
        data.job_matches.forEach(item => {
            matchCard.innerHTML += `
                <div class="match-item mt-1">
                    <label>${item.job}</label>
                    <div class="progress-bar"><div class="bar" style="width: ${item.match}%"></div></div>
                    <span>${item.match}% Match</span>
                </div>
            `;
        });
    } else {
        matchCard.innerHTML += `<p class="text-muted mt-1">No job matches found.</p>`;
    }

    // 3. Set AI Summary / suggestions
    const aiFeedbackText = document.getElementById("ai-feedback-text");
    if (data.job_matches && data.job_matches[0]) {
        const topJob = data.job_matches[0];
        let feedback = `Your resume is a ${topJob.match}% match for a ${topJob.job} role. `;
        if (topJob.suggestions && topJob.suggestions.length > 0) {
            feedback += topJob.suggestions.join(" ");
        } else {
            feedback += "Excellent layout and technical skills detected.";
        }
        aiFeedbackText.textContent = `"${feedback}"`;
    } else {
        aiFeedbackText.textContent = `"Resume analysis is complete, but no specific job matches could be processed."`;
    }

    // 4. Set Skills Found & Missing
    const skillsFoundContainer = document.getElementById("skills-found");
    const skillsMissingContainer = document.getElementById("skills-missing");

    skillsFoundContainer.innerHTML = "";
    skillsMissingContainer.innerHTML = "";

    if (data.skills_found && data.skills_found.length > 0) {
        data.skills_found.forEach(skill => {
            const chip = document.createElement("span");
            chip.className = "chip chip-success";
            chip.textContent = skill;
            skillsFoundContainer.appendChild(chip);
        });
    } else {
        skillsFoundContainer.innerHTML = `<span class="text-muted">No specific tech skills detected.</span>`;
    }

    if (data.job_matches && data.job_matches[0]) {
        const missing = data.job_matches[0].missing_skills;
        if (missing && missing.length > 0) {
            missing.forEach(skill => {
                const chip = document.createElement("span");
                chip.className = "chip chip-danger";
                chip.textContent = skill;
                skillsMissingContainer.appendChild(chip);
            });
        } else {
            skillsMissingContainer.innerHTML = `<span class="chip chip-success">None! You have all the core skills.</span>`;
        }
    } else {
        skillsMissingContainer.innerHTML = `<span class="text-muted">No missing skills computed.</span>`;
    }

    // 5. Recommended Learning
    const videoContainer = document.getElementById("video-recommendations");
    videoContainer.innerHTML = "";

    if (data.learning_recommendations && data.learning_recommendations.length > 0) {
        data.learning_recommendations.forEach(item => {
            videoContainer.innerHTML += `
                <div class="video-item">
                    <i class="fab fa-youtube"></i>
                    <div>
                        <p>${item.title} (${item.skill})</p>
                        <a href="${item.url}" target="_blank" class="small-link">Watch Tutorial</a>
                    </div>
                </div>
            `;
        });
    } else {
        videoContainer.innerHTML = `<p class="text-muted">No tutorials recommended. Looks like you're fully matched!</p>`;
    }
}

function downloadPDF() {
    window.print();
}
