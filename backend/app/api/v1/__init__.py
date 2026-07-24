from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.organizations import router as org_router
from app.api.v1.workspaces import router as ws_router
from app.api.v1.teams import router as teams_router
from app.api.v1.projects import router as projects_router
from app.api.v1.sprints import router as sprints_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.kanban import router as kanban_router
from app.api.v1.calendar import router as calendar_router
from app.api.v1.timetracking import router as timetracking_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.search import router as search_router
from app.api.v1.files import router as files_router
from app.api.v1.ai import router as ai_router
from app.api.v1.admin import router as admin_router
from app.api.v1.contact import router as contact_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(org_router)
api_v1_router.include_router(ws_router)
api_v1_router.include_router(teams_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(sprints_router)
api_v1_router.include_router(tasks_router)
api_v1_router.include_router(kanban_router)
api_v1_router.include_router(calendar_router)
api_v1_router.include_router(timetracking_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(search_router)
api_v1_router.include_router(files_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(contact_router)

__all__ = ["api_v1_router"]
