<div align="center">
  <img src="./frontend/public/taskmaster-logo.svg" alt="TaskMaster Logo" width="120" height="120" />
  <h1>TaskMaster - Enterprise SaaS Task Management Platform</h1>
  
  <p><strong>A full-stack, enterprise-grade task and project management application inspired by Jira, ClickUp, and Asana.</strong></p>

  <p>
    <a href="https://taskmaster-tm.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
    <a href="https://taskmaster-z52i.onrender.com/api/v1/docs" target="_blank">
      <img src="https://img.shields.io/badge/Backend-Render-black?style=for-the-badge&logo=render" alt="Backend Demo" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/MongoDB-Motor-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-Styled-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  </p>
</div>

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Local Development Setup](#-local-development-setup)
- [Live Deployments](#-live-deployments)

---

## 🚀 Overview

**TaskMaster** is an advanced Task & Project Management SaaS platform designed to boost team productivity and streamline workflow management. Built for scale, it utilizes cutting edge asynchronous python with FastAPI, real-time websockets, and a beautiful React front-end.

> *Empower your teams to stay organized, collaborate in real-time, and deliver faster with TaskMaster.*

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| ⚡ **Dynamic Kanban Board** | Drag-and-drop task management across customizable columns with instant persistence. |
| 🔄 **Real-time Synchronization** | WebSockets ensure instant updates across all connected clients without page reloads. |
| 🔐 **Secure Authentication** | Robust JWT-based authentication and secure session management. |
| 🎨 **Enterprise-Grade UI** | Built with React, Tailwind CSS, and Framer Motion for premium aesthetics. |
| 📋 **Project & Task Management** | Detailed task views, labels, priorities, assignments, and due dates. |
| 🤖 **AI Integration** | AI-powered task summarization and suggestions via Google Generative AI (Gemini). |

---

## 📸 Screenshots

<details>
<summary><b>Click to expand and view application screenshots</b></summary>
<br/>

### 1. Landing Page
*The marketing homepage showcasing the value proposition of TaskMaster.*
![Landing Page](./docs/screenshots/1_landing_page.png)

### 2. Dashboard
*An overview of your projects, tasks, and recent activity.*
![Dashboard](./docs/screenshots/5_dashboard.png)

### 3. Kanban Board
*The interactive drag-and-drop Kanban board for managing task workflows.*
![Kanban Board](./docs/screenshots/6_kanban_board.png)

### 4. Pricing & Plans
*Flexible SaaS subscription tiers.*
![Pricing Page](./docs/screenshots/2_pricing_page.png)

### 5. Authentication
*Secure login and registration flows.*
<p float="left">
  <img src="./docs/screenshots/3_login_page.png" width="49%" />
  <img src="./docs/screenshots/4_register_page.png" width="49%" />
</p>

</details>

---

## 🛠️ Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <h3>🎨 Frontend</h3>
        <b>Framework:</b> React 18 (Vite)<br>
        <b>Language:</b> TypeScript<br>
        <b>Styling:</b> Tailwind CSS, Framer Motion<br>
        <b>State Management:</b> Zustand, React Query<br>
        <b>Routing:</b> React Router DOM v6<br>
        <b>Real-time:</b> Socket.IO-Client
      </td>
      <td align="center" width="50%">
        <h3>⚙️ Backend</h3>
        <b>Framework:</b> FastAPI (Python 3.11+)<br>
        <b>Database:</b> MongoDB (Motor / Beanie ODM)<br>
        <b>Authentication:</b> JWT, Passlib, bcrypt<br>
        <b>Real-time:</b> python-socketio<br>
        <b>AI Integration:</b> Google Generative AI (Gemini)<br>
        <b>Task Queue:</b> Celery + Redis
      </td>
    </tr>
  </table>
</div>

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
  <b>Built with ❤️ by DINESH KUMAR YADAV</b><br/>
  <i>Enterprise SaaS Task Management Platform</i>
</div>
