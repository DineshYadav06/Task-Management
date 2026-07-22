# API Documentation & Specifications

The Enterprise SaaS Task Management API adheres strictly to REST principles, versioned under `/api/v1`.

## Authentication & Authorization
All secured endpoints require an `Authorization: Bearer <access_token>` header. Access tokens expire in 60 minutes, while refresh tokens can be used at `/api/v1/auth/refresh` to obtain new tokens.

### Role-Based Access Control (RBAC) Matrix
| Role | Organization Settings | Workspace Creation | Project Creation | Task Management | Invite Users |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Organization Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Project Manager** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Team Lead** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Employee** | ❌ | ❌ | ❌ | ✅ (Assigned) | ❌ |
| **Guest** | ❌ | ❌ | ❌ | View Only | ❌ |

---

## Core API Endpoints Overview

### Authentication (`/api/v1/auth`)
* `POST /login` - Obtain JWT access and refresh tokens.
* `POST /register` - Register a new user account.
* `POST /refresh` - Refresh access token using refresh token.
* `GET /me` - Retrieve current user profile and role memberships.
* `POST /oauth/{provider}` - Authenticate via Google or GitHub OAuth.

### Organizations (`/api/v1/organizations`)
* `GET /` - List all organizations for current user.
* `POST /` - Create a new organization.
* `GET /{id}` - Get organization details, members, and billing info.
* `POST /{id}/invite` - Send email invitation to join organization.

### Workspaces (`/api/v1/workspaces`)
* `GET /?organization_id={id}` - List workspaces in organization.
* `POST /` - Create a new workspace.
* `GET /{id}/analytics` - Retrieve workspace KPI overview.

### Projects & Sprints (`/api/v1/projects`, `/api/v1/sprints`)
* `GET /projects?workspace_id={id}` - List projects in workspace.
* `POST /projects` - Create a new project from scratch or template.
* `GET /projects/{id}/health` - Retrieve AI-evaluated Project Health Score.
* `POST /sprints` - Create a sprint.
* `GET /sprints/{id}/burndown` - Retrieve burndown chart coordinates.

### Tasks (`/api/v1/tasks`)
* `GET /tasks?project_id={id}&sprint_id={id}` - List tasks with pagination, filtering, and sorting.
* `POST /tasks` - Create a new task with custom fields.
* `PUT /tasks/{id}` - Update task details, priority, or status.
* `POST /tasks/{id}/comments` - Add markdown comment with mentions `@user`.
* `POST /tasks/{id}/attachments` - Upload file attachment.

### Kanban & Board Management (`/api/v1/kanban`)
* `GET /board/{project_id}` - Get swimlane structured board with columns.
* `PUT /board/move` - Drag & drop task update across columns/swimlanes.

### Time Tracking (`/api/v1/timetracking`)
* `POST /start` - Start live timer for a task.
* `POST /stop` - Stop timer and log duration.
* `GET /timesheet` - Retrieve daily/weekly timesheet reports.

### AI Assistant (`/api/v1/ai`)
* `POST /summarize-task` - Generate concise bullet summary of task description and comments.
* `POST /suggest-priority` - Suggest task priority & severity based on context.
* `POST /generate-description` - Expand rough notes into professional markdown specification.

---

## Real-Time WebSocket Protocol (`/ws/{client_id}`)
Connected clients subscribe to room topics (`org:{id}`, `project:{id}`).
* Events emitted: `task:updated`, `task:created`, `comment:added`, `user:typing`, `user:online`.
