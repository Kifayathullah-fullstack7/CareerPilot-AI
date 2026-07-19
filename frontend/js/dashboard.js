// js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {

    loadUser();
    loadRecentResumes();

});

// ----------------------------
// Load Logged-in User
// ----------------------------

function loadUser() {

    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {

        document.getElementById("user-name").textContent = user.full_name;

    } else {

        document.getElementById("user-name").textContent = "User";

    }

}

// ----------------------------
// Recent Resume Data
// ----------------------------

async function loadRecentResumes() {

    const table = document.getElementById("recent-list");

    table.innerHTML = `
        <tr>
            <td colspan="3" style="text-align:center;">
                Loading...
            </td>
        </tr>
    `;

    try {

        /*
            Flask Endpoint

            GET /dashboard

            Response Example

            [
                {
                    "resume_name":"Software Engineer Resume",
                    "score":87,
                    "date":"2026-07-18"
                }
            ]
        */

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) return;
        const response = await fetch(`${API_BASE_URL}/dashboard?user_id=${user.id}`);

        if (!response.ok)
            throw new Error("Server Error");

        const resumes = await response.json();

        table.innerHTML = "";

        if (resumes.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="3">
                        No Resume Found
                    </td>
                </tr>
            `;

            return;
        }

        resumes.forEach(item => {

            table.innerHTML += `
                <tr>

                    <td>${item.resume_name}</td>

                    <td>

                        <span style="color:#10B981;font-weight:600;">
                            ${item.score}%
                        </span>

                    </td>

                    <td>${item.date}</td>

                </tr>
            `;

        });

    }

    catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="3">
                    Unable to load resumes.
                </td>
            </tr>
        `;

    }

}
