# 🚀 Step-by-Step Production Deployment Guide

Follow these steps to host and sync **CareerPilot AI** using your actual production stack: **Netlify** (Frontend), **Render** (Backend), and **Railway** (Database).

---

## 1. Cloud Database Setup (Railway)

Railway is excellent for hosting cloud databases with simple environment setup.

1. Sign up/log in at [Railway.app](https://railway.app/).
2. Click **New Project** > **Provision MySQL**.
3. Once the database container is provisioned:
   - Go to the **Variables** tab or click on connection details.
   - Copy the connection parameters:
     - `MYSQLHOST` (Host URL)
     - `MYSQLPORT` (Port, usually `3306`)
     - `MYSQLUSER` (Username, e.g., `root`)
     - `MYSQLPASSWORD` (Password)
     - `MYSQLDATABASE` (Database name)
4. Open your MySQL client (like DBeaver, MySQL Workbench, or command line) and connect to the Railway cloud instance.
5. Copy and execute the contents of [backend/schema.sql](file:///d:/CareerPilot-AI/backend/schema.sql) to initialize your database structure online.

---

## 2. Backend Flask Deployment (Render)

Render auto-deploys your Python Flask project directly from GitHub.

1. Ensure your latest changes are pushed to your GitHub repository.
2. Log in at [Render.com](https://render.com/).
3. Click **New** > **Web Service** and connect your GitHub repository.
4. Configure the service settings:
   - **Name**: `careerpilot-backend`
   - **Environment**: `Python`
   - **Root Directory**: `backend` (this directs Render to your Flask directory)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Under **Environment Variables**, add the connection details for your Railway MySQL database:
   - `DB_HOST` = (Your Railway host URL)
   - `DB_PORT` = (Your Railway port)
   - `DB_USER` = (Your Railway user)
   - `DB_PASSWORD` = (Your Railway password)
   - `DB_DATABASE` = (Your Railway database name)
6. Click **Deploy Web Service**. Once Render successfully builds, copy the generated live URL (e.g. `https://careerpilot-backend.onrender.com`).

---

## 3. Frontend Web Deployment (Netlify)

Netlify is excellent for building and hosting static HTML/CSS/JS frontend websites.

1. Log in at [Netlify.com](https://www.netlify.com/) using your GitHub account.
2. Click **Add New Site** > **Import an existing project** and link your GitHub repository.
3. Configure your build settings:
   - **Branch to deploy**: `main`
   - **Base directory**: `frontend` (this tells Netlify to build only the static page contents)
   - **Build command**: Leave blank (Vanilla HTML/CSS/JS needs no compilation)
   - **Publish directory**: `.` (which points to the root of the `frontend` folder)
4. Click **Deploy Site**. Netlify will launch the website and provide you with a live URL (e.g. `https://careerpilot-ai.netlify.app`).

---

## 4. Link Frontend to Cloud Backend

1. Open [frontend/js/main.js](file:///d:/CareerPilot-AI/frontend/js/main.js).
2. Ensure the fallback production URL points to your Render backend service URL:
   ```javascript
   : localStorage.getItem("custom_api_base_url") || "YOUR_RENDER_BACKEND_URL";
   ```
3. Save, commit, and push changes to GitHub:
   ```bash
   git add .
   git commit -m "chore: update production backend URL in client script"
   git push origin main
   ```
4. **Netlify** will automatically trigger a new build and update your live site within seconds! 🎉
