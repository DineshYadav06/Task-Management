# Contributing Guidelines

We welcome contributions to the Enterprise SaaS Task Management Platform. To maintain FAANG-level code quality and clean architecture, please adhere to the following standards:

## 1. Clean Architecture & SOLID Principles
* **Single Responsibility**: Keep models, schemas, routers, and services strictly decoupled. Routers handle HTTP request/response formatting, while business logic resides inside `app/services/`.
* **Dependency Injection**: Always use FastAPI `Depends()` for database sessions, current user context, and permission verification.
* **Strict Typing**: All backend Python functions must include type annotations (`typing` / Python 3.11+ hints). All frontend React code must use strict TypeScript interfaces with zero `any` types.

## 2. Pull Request (PR) Checklist
1. Ensure all backend tests pass (`pytest`).
2. Verify zero TypeScript compilation errors (`npm run build`).
3. Ensure no linting errors or formatting violations (`eslint` / `flake8`).
4. Update or add Alembic migrations if modifying SQLAlchemy models.
5. Update `API_DOCUMENTATION.md` and `ER_DIAGRAM.md` if schema changes are introduced.
