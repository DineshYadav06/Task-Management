<div align="center">
  <img src="./frontend/public/taskmaster-logo.svg" alt="TaskMaster Logo" width="120" height="120" />
  <h1>TaskMaster - Enterprise SaaS Task Management Platform</h1>
  <p>A full-stack, enterprise-grade task and project management application inspired by Jira, ClickUp, and Asana.</p>

  <p>
    <a href="https://taskmaster-tm.vercel.app" target="_blank">View Live Demo</a> · 
    <a href="#features">Features</a> · 
    <a href="#tech-stack">Tech Stack</a>
  </p>
</div>

<hr />

## 🚀 Overview

TaskMaster is an advanced Task & Project Management SaaS platform designed to boost team productivity and streamline workflow management. With robust features like real-time Kanban boards, dynamic task creation, role-based access control, and seamless UI/UX, it empowers teams to stay organized and deliver faster.

### ✨ Key Features

- **Dynamic Kanban Board**: Drag-and-drop task management across customizable columns.
- **Real-time Synchronization**: WebSockets ensure instant updates across all connected clients.
- **Secure Authentication**: Robust JWT-based authentication and secure session management.
- **Enterprise-Grade UI**: Built with React, Tailwind CSS, and Framer Motion for premium aesthetics.
- **Project & Task Management**: Detailed task views, labels, priorities, assignments, and due dates.
- **AI Integration**: AI-powered task summarization and suggestions.

---

## 📸 Screenshots

Here are a few glimpses of the application:

### 1. Landing Page
The marketing homepage showcasing the value proposition of TaskMaster.
![Landing Page](./docs/screenshots/1_landing_page.png)

### 2. Dashboard
An overview of your projects, tasks, and recent activity.
![Dashboard](./docs/screenshots/5_dashboard.png)

### 3. Kanban Board
The interactive drag-and-drop Kanban board for managing task workflows.
![Kanban Board](./docs/screenshots/6_kanban_board.png)

### 4. Pricing & Plans
Flexible SaaS subscription tiers.
![Pricing Page](./docs/screenshots/2_pricing_page.png)

### 5. Authentication
Secure login and registration flows.
<p float="left">
  <img src="./docs/screenshots/3_login_page.png" width="49%" />
  <img src="./docs/screenshots/4_register_page.png" width="49%" />
</p>

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand, React Query
- **Routing**: React Router DOM v6
- **Real-time**: Socket.IO-Client

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB (Motor / Beanie ODM)
- **Authentication**: JWT, Passlib, bcrypt
- **Real-time**: python-socketio
- **AI Integration**: Google Generative AI (Gemini)
- **Task Queue**: Celery + Redis

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- MongoDB Atlas URL or Local MongoDB
- Redis (for background tasks & WebSockets)

### 2. Backend Setup
\\\ash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate

pip install -r requirements.txt

# Create a .env file with your configurations
# MONGODB_URI=your_mongo_url
# SECRET_KEY=your_secret_key

uvicorn app.main:app --reload --port 8001
\\\

### 3. Frontend Setup
\\\ash
cd frontend
npm install

# Set your API URL in .env
# VITE_API_URL=http://localhost:8001/api/v1

npm run dev
\\\

---

## 🌍 Live Deployments

- **Frontend (Vercel)**: [https://taskmaster-tm.vercel.app](https://taskmaster-tm.vercel.app)
- **Backend (Render)**: [https://taskmaster-z52i.onrender.com](https://taskmaster-z52i.onrender.com)

---
<div align="center">
  <i>Built with ❤️ for High-Performing Teams.</i>
</div>
