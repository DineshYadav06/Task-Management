# Task Management

Task Management is organized as a full-stack-ready repository with a FastAPI
backend and a reserved frontend boundary.

## Repository layout

```text
backend/     FastAPI application, tests, Alembic, environment, Dockerfile
frontend/    Reserved for the client application (none was supplied)
docs/        Existing project reports and project documentation
postman/     Reserved for API collections
```

## Run the API

```powershell
cd backend
python -m uvicorn src.main:app --reload
```

The API remains available at the same paths:

- `POST /users/register`, `POST /users/login`, `GET /users/check-auth`
- `POST /tasks/create`, `GET /tasks/all`, `GET /tasks/search?q=...`
- `GET`, `PUT`, and `DELETE /tasks/{task_id}`

Protected routes require `Authorization: Bearer <token>`. Interactive API
documentation is available at `http://localhost:8000/docs`.

## Tests

```powershell
cd backend
python -m pytest
```

## Frontend status

The original repository did not contain frontend code, a package manifest, or
build configuration. To avoid replacing existing functionality with fabricated
screens or mock requests, no client was generated. When the actual client is
available, place it in `frontend/` and configure its API base URL through an
environment variable such as `VITE_API_BASE_URL`.
