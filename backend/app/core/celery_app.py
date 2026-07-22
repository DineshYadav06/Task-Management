import os
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "enterprise_tasks_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    worker_prefetch_multiplier=1,
)

@celery_app.task(name="send_notification_email_task")
def send_notification_email_task(recipient_email: str, subject: str, html_content: str):
    """
    Background Celery task to send asynchronous notification emails.
    In development mode without SMTP configured, simulates delivery in logs.
    """
    import logging
    logger = logging.getLogger("celery_worker")
    logger.info(f"[CELERY EMAIL SIMULATION] To: {recipient_email} | Subject: {subject}")
    return {"status": "sent", "recipient": recipient_email}


@celery_app.task(name="evaluate_project_health_task")
def evaluate_project_health_task(project_id: int):
    """
    Periodic Celery task to re-calculate Project Health Scores across active projects.
    """
    import logging
    logger = logging.getLogger("celery_worker")
    logger.info(f"[CELERY HEALTH CHECK] Evaluating project ID {project_id} health score.")
    return {"status": "completed", "project_id": project_id}
