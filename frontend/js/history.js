// js/history.js

document.addEventListener("DOMContentLoaded", () => {
    loadHistory();
});

async function loadHistory() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
        window.location.href = "login.html";
        return;
    }

    const tableBody = document.getElementById("history-list");
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center; padding: 20px;">
                Loading your resume history...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/history?user_id=${user.id}`);
        if (!response.ok) {
            throw new Error("Failed to retrieve resume history.");
        }

        const resumes = await response.json();
        tableBody.innerHTML = "";

        if (resumes.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">
                        No resumes analyzed yet. Upload a resume to get started!
                    </td>
                </tr>
            `;
            return;
        }

        resumes.forEach(item => {
            // Determine score class based on value
            let pillStyle = "background: rgba(16,185,129,0.15); color: var(--success);";
            if (item.score < 50) {
                pillStyle = "background: rgba(239,68,68,0.15); color: var(--danger);";
            } else if (item.score < 80) {
                pillStyle = "background: rgba(245,158,11,0.15); color: #F59E0B;";
            }

            tableBody.innerHTML += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); height: 50px;">
                    <td>${item.resume_name}</td>
                    <td>
                        <span style="${pillStyle} padding: 4px 8px; border-radius: 4px; font-weight: 600;">
                            ${item.score}%
                        </span>
                    </td>
                    <td>${item.job_match}</td>
                    <td>${item.date}</td>
                    <td>
                        <button class="btn btn-outline" onclick="viewResult(${item.id})" style="padding: 4px 10px; font-size:12px; height:auto;">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 20px; color: var(--danger);">
                    Unable to load resume history. Please try again.
                </td>
            </tr>
        `;
    }
}

// Global scope hook so it can be called from onclick attribute
window.viewResult = function(id) {
    localStorage.setItem("last_resume_id", id);
    window.location.href = `result.html?id=${id}`;
};


