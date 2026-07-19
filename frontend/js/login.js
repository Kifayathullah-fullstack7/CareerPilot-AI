// js/login.js

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    form.addEventListener("submit", loginUser);

});

async function loginUser(e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {

        toast("Please enter email and password.", "error");
        return;

    }

    showLoader();

    try {

        const response = await fetch(`${API_BASE_URL}/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });

        const data = await response.json();

        hideLoader();

        if (data.success) {

            localStorage.setItem("user", JSON.stringify(data.user));

            toast("Login Successful!", "success");

            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 1000);

        } else {

            toast(data.message, "error");

        }

    } catch (error) {

        hideLoader();

        console.error(error);

        toast("Cannot connect to server.", "error");

    }

}