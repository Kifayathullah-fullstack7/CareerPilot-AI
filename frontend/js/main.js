// js/main.js

// Apply saved theme immediately to prevent flash of wrong theme
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
})();

// Backend API URL
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:"
    ? "http://127.0.0.1:5000"
    : localStorage.getItem("custom_api_base_url") || "https://careerpilot-ai-lpt8.onrender.com";
window.API_BASE_URL = API_BASE_URL;

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

// ==========================================================
// Responsive Navigation & Interactions (Mobile/Tablet)
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Landing Page Navbar Toggler
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('nav-open');
            const icon = navToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('nav-open')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });
        
        // Close nav links when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('nav-open') && !navLinks.contains(e.target) && e.target !== navToggle && !navToggle.contains(e.target)) {
                navLinks.classList.remove('nav-open');
                const icon = navToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });
    }

    // 2. Dynamic Mobile App Header & Sidebar Drawer Toggling
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');
    
    // Only apply on pages where sidebar is present and it is a dashboard page (not landing)
    if (sidebar && mainContent) {
        // Create backdrop overlay dynamically
        const backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop no-print';
        document.body.appendChild(backdrop);

        // Create mobile header dynamically
        const mobileHeader = document.createElement('div');
        mobileHeader.className = 'mobile-app-header no-print';
        mobileHeader.innerHTML = `
            <button id="sidebar-toggle" class="sidebar-toggle-btn" aria-label="Toggle Sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <div class="mobile-logo">
                <i class="fas fa-paper-plane"></i> CareerPilot <span>AI</span>
            </div>
            <div style="width: 32px;"></div> <!-- visual spacing balance -->
        `;
        
        // Insert at the TOP of body so it's always above everything
        document.body.insertBefore(mobileHeader, document.body.firstChild);
        
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = sidebar.classList.toggle('sidebar-open');
                backdrop.classList.toggle('active', isOpen);
            });
        }
        
        // Close sidebar helper
        const closeSidebar = () => {
            sidebar.classList.remove('sidebar-open');
            backdrop.classList.remove('active');
        };

        backdrop.addEventListener('click', closeSidebar);
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('sidebar-open') && !sidebar.contains(e.target) && sidebarToggle && !sidebarToggle.contains(e.target) && !mobileHeader.contains(e.target)) {
                closeSidebar();
            }
        });
        
        // Close sidebar on navigation links clicked inside drawer
        const sidebarLinks = sidebar.querySelectorAll('a, button');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', closeSidebar);
        });
    }
});