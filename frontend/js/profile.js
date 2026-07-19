// js/profile.js

document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
});

async function loadProfile() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
        window.location.href = "login.html";
        return;
    }

    showLoader();

    try {
        const response = await fetch(`${API_BASE_URL}/profile?user_id=${user.id}`);
        if (!response.ok) {
            throw new Error("Failed to load profile details.");
        }

        const data = await response.json();
        hideLoader();

        if (data.success) {
            document.getElementById("profile-name").textContent = data.full_name;
            document.getElementById("profile-email").textContent = data.email;
            document.getElementById("profile-joined").textContent = `Member since ${data.registered_at}`;
            document.getElementById("profile-uploads").textContent = `${data.total_uploads} Total`;
            document.getElementById("profile-average-score").textContent = `${data.average_score}%`;

            // Initials avatar
            if (data.full_name) {
                const parts = data.full_name.trim().split(/\s+/);
                const initials = parts.map(p => p[0]).join("").slice(0, 2).toUpperCase();
                document.getElementById("profile-avatar").textContent = initials;
            }
        } else {
            toast(data.message || "Failed to retrieve profile data.", "error");
        }

    } catch (error) {
        hideLoader();
        console.error(error);
        toast("Unable to connect to server.", "error");
    }
}


