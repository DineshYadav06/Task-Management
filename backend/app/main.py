import logging
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError


from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1 import api_v1_router
from app.sockets.manager import socket_manager
import app.models  # noqa: F401 - ensures all tables are registered with SQLAlchemy


logger = logging.getLogger("enterprise_app")
logging.basicConfig(level=logging.INFO)

# Initialize Enterprise FastAPI Application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="World-Class Enterprise SaaS Task & Project Management Platform (Jira + ClickUp + Asana + Trello Clone)",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Versioned API v1 Router
app.include_router(api_v1_router)



# Create database tables automatically on startup
@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Successfully registered and initialized database schema.")
    except Exception as exc:
        logger.warning(f"Database initialization deferred or failed: {exc}")


@app.get("/", tags=["System Health"])
def root_health_check():
    """
    Root endpoint returning enterprise platform status and API documentation URL.
    """
    return {
        "status": "ok",
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "api_v1_docs": f"{settings.API_V1_STR}/docs",
        "timestamp": app.state.__dict__.get("startup_time", "Active")
    }


# Enterprise WebSocket connection endpoint for real-time room & personal updates
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, rooms: str = None):
    room_list = [r.strip() for r in rooms.split(",") if r.strip()] if rooms else []
    await socket_manager.connect(websocket, user_id, room_list)
    try:
        while True:
            data = await websocket.receive_json()
            # Client command handling (e.g. subscribing to additional rooms dynamically)
            if isinstance(data, dict):
                action = data.get("action")
                room = data.get("room")
                if action == "subscribe" and room:
                    if room not in socket_manager.active_rooms:
                        socket_manager.active_rooms[room] = []
                    if websocket not in socket_manager.active_rooms[room]:
                        socket_manager.active_rooms[room].append(websocket)
                elif action == "unsubscribe" and room:
                    if room in socket_manager.active_rooms and websocket in socket_manager.active_rooms[room]:
                        socket_manager.active_rooms[room].remove(websocket)
    except WebSocketDisconnect:
        socket_manager.disconnect(websocket, user_id)
    except Exception as exc:
        logger.error(f"WebSocket error for user {user_id}: {exc}")
        socket_manager.disconnect(websocket, user_id)


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"SQLAlchemy Database Error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "message": "Enterprise database transaction failure", "detail": str(exc)}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "message": "An unexpected server error occurred"}
    )
