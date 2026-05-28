# TaskFlow - MERN Stack Project

A production-ready MERN Stack application featuring React 18 frontend and Node.js + Express backend.

## Project Structure

```
root/
├── client/          # React 18 + Vite frontend
├── server/          # Node.js + Express backend
├── README.md
└── .gitignore
```

---

## Local Development Setup

### 1. Database Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas) if you haven't already.
2. Build a new MongoDB cluster.
3. In "Database Access", create a database user and password.
4. In "Network Access", add `0.0.0.0/0` to allow all IP addresses.
5. In "Database", click "Connect" -> "Drivers" to get your connection string.

### 2. Backend Setup (`/server`)
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file and set the required variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CLIENT_URL=http://localhost:5173
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:5000`.*

### 3. Frontend Setup (`/client`)
1. Open a NEW terminal and navigate to the frontend folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Check your `.env` to ensure it targets your backend properly:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
5. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The client should now be running on `http://localhost:5173`.*

---

## Deployment Guide

### A. Deploying the Backend to Render
1. Create an account on [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Application deployment settings:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
5. Environment Variables Setup (IMPORTANT):
   - Add `MONGODB_URI` = `<your database connection string>`
   - Add `CLIENT_URL` = `<leave blank for now, you will update this after frontend deployment>`
6. Click **Deploy Web Service** and wait for completion.
7. Copy the backend API URL (e.g., `https://taskflow-api.onrender.com`).

### B. Deploying the Frontend to Vercel
1. Create an account on [Vercel](https://vercel.com/).
2. Click **Add New Project** and import your GitHub repository.
3. Application setup:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Environment Variables Setup:
   - Add `VITE_API_URL` = `<your Render backend URL>` (e.g., `https://taskflow-api.onrender.com`)
5. Click **Deploy** and wait for completion.
6. Copy the frontend URL (e.g., `https://taskflow.vercel.app`).

### C. Final Cors Link
1. Go back to your Render backend project settings.
2. Under "Environment Variables", update `CLIENT_URL` to your new Vercel App URL to authorize it in CORS. 
   - `CLIENT_URL` = `https://taskflow.vercel.app`
3. Save changes in Render to trigger a rapid reboot.

---

## Troubleshooting common deployment issues

- **CORS Errors:**
  - Verify your backend environment variable `CLIENT_URL` exactly matches the URL logged in the browser, without an ending slash (e.g., `https://myapp.vercel.app`).
- **Cannot connect to database:**
  - Ensure the IP access list in MongoDB Atlas includes `0.0.0.0/0` because Render has Dynamic IP Addresses.
  - Verify your connection string replaces `<password>` correctly.
- **Frontend 404 on Refresh (React/Vite):**
  - Make sure Vercel's rewrite rules are properly captured. Vite SPA needs `vercel.json` optionally, but strictly doing a normal react-dom render usually handles history gracefully.
- **Render Build Fails:**
  - Double check you have selected `server` as the Root Directory. If deployed without setting root dir, Render attempts to build the root package instead.
