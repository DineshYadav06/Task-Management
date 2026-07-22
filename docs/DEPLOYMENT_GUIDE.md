# Production Deployment Guide

This guide outlines step-by-step instructions for deploying the Enterprise SaaS Task Management Platform across Docker, Render, AWS, and Vercel.

## 1. Turnkey Docker Compose Deployment (Recommended)
You can launch the entire stack (PostgreSQL, Redis, Celery Worker, FastAPI Backend, React Frontend, and Nginx Gateway) using Docker Compose on any Linux/Windows server.

```bash
# Clone the repository
git clone <your-repo-url>
cd Task\ Management

# Verify environment configuration in docker-compose.yml
# Start the containers in detached mode
docker-compose up -d --build

# Verify container health
docker-compose ps
```

The application is now accessible at `http://your-server-ip/` (Nginx proxies `/api/v1` and `/ws` to FastAPI and `/` to React).

---

## 2. Separate Cloud Deployment (Vercel + Render/AWS)

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel.
2. Set the Root Directory to `frontend`.
3. Configure Environment Variables:
   * `VITE_API_BASE_URL`: `https://api.yourdomain.com/api/v1`
   * `VITE_WS_BASE_URL`: `wss://api.yourdomain.com/ws`
4. Deploy.

### Backend Deployment (Render / AWS ECS / Docker)
1. Deploy a managed PostgreSQL 16 instance and a Redis 7 instance.
2. Set the Root Directory to `backend` and use the `Dockerfile`.
3. Configure Environment Variables:
   * `DB_CONNECTION`: `postgresql+psycopg2://user:password@hostname:5432/dbname`
   * `REDIS_URL`: `redis://redis-host:6379/0`
   * `CELERY_BROKER_URL`: `redis://redis-host:6379/1`
   * `SECRET_KEY`: `<high-entropy-random-secret>`
   * `GEMINI_API_KEY`: `<optional-google-ai-key>`
4. Set up a secondary worker service running `celery -A app.core.celery_app.celery_app worker --loglevel=info`.
