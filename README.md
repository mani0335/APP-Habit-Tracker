<<<<<<< HEAD
# Daily-Report
=======
# Welcome to your  project

## Project info

**URL**: 

## How can I edit this code?

There are several ways of editing your application.
# Habit Flow AI

**What this website is**
- **Description:** Habit Flow AI is a lightweight habit-tracking web app for tracking daily habits, viewing progress charts, and taking notes. The frontend is built with React + Vite and includes an example Express server in `server/` for local/demo user persistence.

**Who can log in**
- **Anyone:** Users can register and sign in. For local/demo use the project includes a simple Express backend that stores users in `server/users.json`.
- **Guest/demo mode:** If no backend is used, the app falls back to browser `localStorage` for per-device data.
- **Admin:** The app has an `Admin` page (`/admin`) that is protected; admin users can view and manage users when the example backend is running.

**What it uses**
- **Frontend:** Vite, React, TypeScript, React Router, TanStack Query, Tailwind CSS, shadcn-style UI components.
- **Backend (example):** Minimal Express server in [server/index.js](server/index.js) that reads/writes `server/users.json` (demo only).

**Admin part**
- **Access:** Only authenticated admin users can access `/admin` (enforced by the frontend `RequireAdmin` guard).
- **Features:** List users, delete users (only when using the example server). In production you must secure admin endpoints and use proper authentication & authorization flows.

**Setup (local development)**
1. Install frontend dependencies and start the dev server:

```powershell
cd "c:\Users\manish\Desktop\Projects\habit-flow-ai-main\habit-flow-ai-main"
npm install
npm run dev
```

2. (Optional) Start the example backend for shared users:

```powershell
cd server
npm install
npm run start
# The server listens on PORT (default 4000). If port is in use set $env:PORT to another port.
```

3. Open the Vite URL printed in the terminal (e.g. `http://localhost:8084`) and test the app.

**Important: multi-device behavior**
- Deploying the frontend alone (to Vercel) does not make registrations shared — `localStorage` is device-specific.
- To enable shared users across devices, deploy a backend or use a hosted BaaS (Supabase, Firebase) and update the frontend to use that API/SDK. Set `VITE_API_BASE` to the backend URL in your deployment environment.

**Deployment suggestions**
- **Frontend:** Deploy static frontend to Vercel (set `VITE_API_BASE` env var to your backend URL).
- **Backend:** Deploy the Express server to Render, Railway, Fly, or convert to serverless functions and use a managed DB (Supabase, PlanetScale, etc.).

**Security & production notes**
- Do not store passwords in plaintext. Use hashed passwords, proper authentication (JWT/sessions) or a hosted auth provider.
- Protect admin routes and restrict access server-side.

**Where to look in the code**
- Entry: [index.html](index.html) and [src/main.tsx](src/main.tsx)
- App & routing: [src/App.tsx](src/App.tsx)
- Auth context: [src/context/AuthContext.tsx](src/context/AuthContext.tsx)
- Hooks: [src/hooks/useHabits.ts](src/hooks/useHabits.ts)
- Example server: [server/index.js](server/index.js)

If you'd like, I can help: migrate the demo server to a hosted backend, integrate Supabase/Firebase for auth and shared storage, or prepare a Vercel deployment with serverless functions — tell me which option you prefer and I'll implement the next steps.
