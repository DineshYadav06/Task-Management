from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.task import TaskModel
from app.models.project import Project, ProjectHealthScore


class ProjectHealthEvaluator:
    """
    Evaluates project health based on overdue tasks, blocker severity ratio, and WIP progress.
    """
    @staticmethod
    def evaluate(db: Session, project_id: int) -> Dict[str, Any]:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"score": 0.0, "reason": "Project not found"}

        tasks = db.query(TaskModel).filter(TaskModel.project_id == project_id).all()
        if not tasks:
            score = 100.0
            reason = "Project initialized cleanly; no tasks created yet."
        else:
            total_tasks = len(tasks)
            completed_tasks = sum(1 for t in tasks if t.is_completed or t.status == "DONE")
            now = datetime.utcnow()
            overdue_tasks = sum(1 for t in tasks if t.due_date and t.due_date < now and not t.is_completed)
            blocker_tasks = sum(1 for t in tasks if t.severity in ["CRITICAL", "BLOCKER"] and not t.is_completed)

            # Health calculation heuristic
            base_score = 100.0
            overdue_penalty = (overdue_tasks / total_tasks) * 35.0
            blocker_penalty = (blocker_tasks / total_tasks) * 45.0
            completion_bonus = (completed_tasks / total_tasks) * 10.0

            score = max(10.0, min(100.0, round(base_score - overdue_penalty - blocker_penalty + completion_bonus, 1)))

            reasons = []
            if overdue_tasks > 0:
                reasons.append(f"{overdue_tasks} overdue tasks impacting timeline")
            if blocker_tasks > 0:
                reasons.append(f"{blocker_tasks} critical/blocker items open")
            if not reasons:
                reasons.append(f"On track with {completed_tasks}/{total_tasks} tasks completed")
            reason = "; ".join(reasons)

        # Update Project health score record
        project.health_score = score
        health_record = ProjectHealthScore(
            project_id=project.id,
            score=score,
            summary_reason=reason
        )
        db.add(health_record)
        db.commit()

        return {"score": score, "summary_reason": reason, "evaluated_at": datetime.utcnow().isoformat()}
