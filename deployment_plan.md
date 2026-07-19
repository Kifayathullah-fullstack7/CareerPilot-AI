# 🚀 Step-by-Step Production Deployment Guide

Follow these steps to host **CareerPilot AI** online for free.

---

## 1. Cloud Database Setup (Aiven or Railway)

We need a hosted MySQL database instance. We will use **Aiven** (which offers a permanently free 1GB MySQL cloud database).

1. Sign up/log in at [Aiven.io](https://aiven.io/).
2. Create a new service:
   - **Service Type**: MySQL
   - **Cloud Provider**: AWS or GCP (select a region closest to you)
   - **Plan**: Free Tier
3. Once the service is running, copy the **Connection Parameters**:
   - **Host** (e.g., `mysql-xxxx.aivencloud.com`)
   - **Port** (e.g., `12345`)
   - **User** (e.g., `avnadmin`)
   - **Password**
   - **Database Name** (default is `defaultdb` or create one named `careerpilot_db`)
4. Open your MySQL client (like MySQL Workbench, DBeaver, or command line) and connect to the cloud database.
5. Copy and execute the contents of [backend/schema.sql](file:///d:/CareerPilot-AI/backend/schema.sql) on the cloud instance to automatically initialize all tables.

---

## 2. Backend Flask Deployment (Render)

Render supports auto-deploying Python Flask projects straight from a GitHub repository.

1. Create a GitHub repository and push your project directory (`CareerPilot-AI/`) to it.
2. Sign up/log in at [Render.com](https://render.com/).
3. Click **New** > **Web Service** and connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `careerpilot-backend`
   - **Environment**: `Python`
   - **Region**: Same region as your database (for minimal latency)
   - **Root Directory**: `backend` (this is very important!)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Scroll down to **Environment Variables** and add the connection credentials of your cloud database:
   - `DB_HOST` = (Your Aiven Host)
   - `DB_PORT` = (Your Aiven Port)
   - `DB_USER` = (Your Aiven User)
   - `DB_PASSWORD` = (Your Aiven Password)
   - `DB_DATABASE` = (Your Aiven Database Name)
6. Click **Deploy Web Service**. Render will build and launch your backend. Once it is running, copy the generated service URL (e.g., `https://careerpilot-backend.onrender.com`).

---

## 3. Frontend Web Deployment (Vercel or Netlify)

Vercel is the fastest and most secure platform for static frontend deployments.

1. Log in to [Vercel.com](https://vercel.com/) (using your GitHub account).
2. Click **Add New** > **Project** and select your GitHub repository.
3. Configure the Project settings:
   - **Name**: `careerpilot-ai`
   - **Framework Preset**: `Other` (since it is a vanilla project)
   - **Root Directory**: `frontend` (this is very important!)
4. Click **Deploy**. Vercel will bundle and host your website immediately and provide you with a production URL (e.g., `https://careerpilot-ai.vercel.app`).

---

## 4. Link Frontend to Cloud Backend

Now that your frontend and backend are deployed, we must connect them:

1. Open your project locally or edit it on GitHub.
2. Open [frontend/js/main.js](file:///d:/CareerPilot-AI/frontend/js/main.js).
3. Update line 5:
   ```javascript
   : localStorage.getItem("custom_api_base_url") || "YOUR_PRODUCTION_BACKEND_URL";
   ```
   Replace `"https://careerpilot-backend.onrender.com"` with the **actual Render Web Service URL** you copied in Step 2.
4. Commit and push the changes to GitHub. Vercel will automatically redeploy the frontend with the correct link!

Your hackathon application is now fully deployed, synchronized, and live online! 🎉
