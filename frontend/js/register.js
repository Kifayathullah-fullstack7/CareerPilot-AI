// js/register.js

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");

    form.addEventListener("submit", registerUser);

});

async function registerUser(e) {

    e.preventDefault();

    const fullName = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!fullName || !email || !password || !confirmPassword) {

        toast("Please fill all fields.", "error");
        return;
    }

    if (password !== confirmPassword) {

        toast("Passwords do not match.", "error");
        return;
    }

    if (password.length < 6) {

        toast("Password must be at least 6 characters.", "error");
        return;
    }

    showLoader();

    try {

        /*
        Flask API

        POST /register

        */

        const response = await fetch(`${API_BASE_URL}/register`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                full_name: fullName,
                email: email,
                password: password

            })

        });

        const data = await response.json();

        hideLoader();

        if (response.ok) {

            toast("Registration Successful!", "success");

            setTimeout(() => {

                window.location.href = "login.html";

            }, 1500);

        }

        else {

            toast(data.message || "Registration Failed", "error");

        }

    }

    catch (err) {

        hideLoader();

        console.error(err);

        toast("Cannot connect to server.", "error");

    }

}