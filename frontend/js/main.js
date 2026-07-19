// js/main.js

window.API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5000"
    : localStorage.getItem("custom_api_base_url") || "https://careerpilot-backend.onrender.com";


// Global Toast Notification
const toast = (message, type = 'info') => {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const div = document.createElement('div');
    div.className = `toast toast-${type} slide-in`;
    div.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    toastContainer.appendChild(div);
    setTimeout(() => {
        div.classList.add('fade-out');
        setTimeout(() => div.remove(), 500);
    }, 3000);
};

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Global Loading Spinner
const showLoader = () => {
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `<div class="spinner"></div>`;
    document.body.appendChild(loader);
};

const hideLoader = () => {
    const loader = document.getElementById('global-loader');
    if (loader) loader.remove();
};

// Check authentication placeholder
const checkAuth = () => {
    const user = localStorage.getItem('user');
    if (!user && !window.location.pathname.includes('login') && !window.location.pathname.includes('register') && window.location.pathname !== '/') {
        window.location.href = 'login.html';
    }
};

document.addEventListener('DOMContentLoaded', checkAuth);

window.loginWithGoogle = () => {
    if (typeof google === "undefined" || !google.accounts || !google.accounts.oauth2) {
        toast("Google library is loading or blocked by security extension. Please check connection.", "error");
        return;
    }

    const client_id = localStorage.getItem("google_client_id") || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

    if (client_id.includes("YOUR_GOOGLE_CLIENT_ID")) {
        const customId = prompt("Enter your Google Client ID from Google Cloud Console to login. (Click Cancel to use mock login instead):");
        if (customId && customId.trim() !== "") {
            localStorage.setItem("google_client_id", customId.trim());
            window.location.reload();
            return;
        } else {
            toast("Logging in as Demo User (Mock)...", "info");
            localStorage.setItem("user", JSON.stringify({
                id: 1,
                full_name: "afrin",
                email: "kifa@gmail.com"
            }));
            setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
            return;
        }
    }

    toast("Opening Google Sign-In...", "info");

    const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: client_id,
        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                try {
                    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                        headers: { "Authorization": `Bearer ${tokenResponse.access_token}` }
                    });
                    const profile = await userInfoRes.json();

                    const backendRes = await fetch(`${API_BASE_URL}/google-login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: profile.email,
                            full_name: profile.name || profile.given_name || "Google User"
                        })
                    });

                    const result = await backendRes.json();
                    if (result.success) {
                        toast(`Google Login successful! Welcome ${result.user.full_name}`, "success");
                        localStorage.setItem("user", JSON.stringify(result.user));
                        setTimeout(() => {
                            window.location.href = "dashboard.html";
                        }, 1500);
                    } else {
                        toast(result.message || "Google registration failed", "error");
                    }
                } catch (error) {
                    console.error("Google Auth failed:", error);
                    toast("Failed to connect to backend server", "error");
                }
            }
        },
        error_callback: (err) => {
            console.error("Token client error:", err);
            toast("Google Sign-In failed to load", "error");
        }
    });

    tokenClient.requestAccessToken({ prompt: "select_account" });
};

window.logout = function() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
};