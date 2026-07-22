# Developer Guide & Folder Structure

This document provides guidelines and setup instructions for local development on the Enterprise SaaS Task Management Platform.

## Repository Folder Structure

```text
c:\Users\Dinesh\Downloads\Task Manegement\
├── docker-compose.yml              # Turnkey local/prod multi-container orchestration
├── nginx/                          # Reverse proxy configuration
├── docs/                           # Architecture, ER diagrams, and API docs
├── backend/                        # FastAPI clean architecture application
│   ├── app/
│   │   ├── main.py                 # FastAPI application factory & middleware setup
│   │   ├── core/                   # Security, settings, db sessions, Redis, Celery
│   │   ├── models/                 # SQLAlchemy 2 declarative models
│   │   ├── schemas/                # Pydantic v2 data transfer objects & validation
│   │   ├── services/               # Business domain logic layer
│   │   ├── api/v1/                 # Versioned REST API endpoints
│   │   └── sockets/                # WebSocket room & connection manager
│   ├── migration/                  # Alembic database migration revisions
│   └── tests/                      # Automated unit & integration tests
└── frontend/                       # React 19 + TypeScript enterprise SPA
    ├── src/
    │   ├── components/             # Reusable UI modules & board views (Kanban, Gantt, Calendar)
    │   ├── pages/                  # Route views (Dashboard, Tasks, Admin, Analytics)
    │   ├── stores/                 # Zustand state management
    │   ├── lib/                    # Axios API client, socket manager, query setup
    │   └── types/                  # TypeScript interface definitions
```

## Local Setup

### Backend Local Setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
Interactive API docs: `http://localhost:8000/docs`.

### Frontend Local Setup
```powershell
cd frontend
npm install
npm run dev
```
Client dev server runs on `http://localhost:3000`.
