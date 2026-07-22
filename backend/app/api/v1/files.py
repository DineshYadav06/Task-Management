import os
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.auth import UserModel
from app.models.task import TaskModel, TaskAttachment, ActivityTimeline
from app.schemas.task import AttachmentResponse

router = APIRouter(prefix="/files", tags=["Attachment & File Management"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_task_attachment(
    task_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Upload a file attachment to a task with version incrementing if filename matches existing."""
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    file_content = await file.read()
    file_size = len(file_content)
    file_ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(file_content)

    # Check versioning
    existing_max_version = db.query(TaskAttachment).filter(
        TaskAttachment.task_id == task_id,
        TaskAttachment.filename == file.filename
    ).order_by(TaskAttachment.version.desc()).first()

    new_version = (existing_max_version.version + 1) if existing_max_version else 1

    attachment = TaskAttachment(
        task_id=task_id,
        uploader_id=current_user.id,
        filename=file.filename,
        file_url=f"/api/v1/files/download/{unique_name}",
        file_size_bytes=file_size,
        file_type=file.content_type or "application/octet-stream",
        version=new_version
    )
    db.add(attachment)

    timeline = ActivityTimeline(
        task_id=task_id,
        event_type="ATTACHED",
        description=f"Attached file {file.filename} (v{new_version})"
    )
    db.add(timeline)
    db.commit()
    db.refresh(attachment)

    return attachment


@router.get("/download/{file_key}")
def download_file(file_key: str) -> FileResponse:
    """Stream or download stored file from uploads storage."""
    file_path = os.path.join(UPLOAD_DIR, file_key)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on storage server")
    return FileResponse(path=file_path, filename=file_key.split("_", 1)[-1] if "_" in file_key else file_key)
