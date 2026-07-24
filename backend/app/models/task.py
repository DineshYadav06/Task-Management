from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class TaskModel(Base):
    """
    Comprehensive Task entity supporting hierarchical subtasks, markdown descriptions,
    agile story points, custom fields, dependencies, and real-time activity tracking.
    Retains `user_tasks` table name and `user_id`/`is_completed` fields for backward compatibility.
    """
    __tablename__ = "user_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assignee_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)
    column_id = Column(Integer, ForeignKey("board_columns.id", ondelete="SET NULL"), nullable=True, index=True)
    sprint_id = Column(Integer, ForeignKey("sprints.id", ondelete="SET NULL"), nullable=True, index=True)
    parent_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=True, index=True)

    title = Column(String(250), nullable=False, index=True)
    description = Column(Text, nullable=True)  # Markdown / Rich Text
    is_completed = Column(Boolean, default=False, nullable=False, index=True)
    status = Column(String(50), default="TODO", nullable=False, index=True)  # DRAFT, TODO, IN_PROGRESS, REVIEW, DONE, BLOCKED
    priority = Column(String(50), default="MEDIUM", nullable=False, index=True)  # LOW, MEDIUM, HIGH, URGENT
    severity = Column(String(50), default="MINOR", nullable=False)  # TRIVIAL, MINOR, MAJOR, CRITICAL, BLOCKER
    story_points = Column(Integer, default=0, nullable=False)
    estimated_hours = Column(Float, default=0.0, nullable=False)
    actual_hours = Column(Float, default=0.0, nullable=False)
    
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    assignee = relationship("UserModel", foreign_keys=[assignee_id], back_populates="tasks_assigned")
    reporter = relationship("UserModel", foreign_keys=[reporter_id], back_populates="tasks_reported")
    project = relationship("Project", back_populates="tasks")
    column = relationship("BoardColumn", back_populates="tasks", foreign_keys=[column_id])
    sprint = relationship("Sprint", back_populates="tasks")
    
    parent = relationship("TaskModel", remote_side=[id], back_populates="subtasks")
    subtasks = relationship("TaskModel", back_populates="parent", cascade="all, delete-orphan")
    
    attachments = relationship("TaskAttachment", back_populates="task", cascade="all, delete-orphan")
    version_history = relationship("TaskVersionHistory", back_populates="task", cascade="all, delete-orphan")
    checklists = relationship("Checklist", back_populates="task", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="task", cascade="all, delete-orphan")
    history_logs = relationship("TaskHistory", back_populates="task", cascade="all, delete-orphan")
    timeline_events = relationship("ActivityTimeline", back_populates="task", cascade="all, delete-orphan")
    watchers = relationship("TaskWatcher", back_populates="task", cascade="all, delete-orphan")
    custom_field_values = relationship("CustomFieldValue", back_populates="task", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_task_project_status", "project_id", "status"),
        Index("idx_task_assignee_due", "assignee_id", "due_date"),
    )


class TaskAttachment(Base):
    """
    Uploaded files linked to a task with versioning and image/video preview flags.
    """
    __tablename__ = "task_attachments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    uploader_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    filename = Column(String(250), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    file_type = Column(String(100), nullable=False)  # image/png, video/mp4, application/pdf
    version = Column(Integer, default=1, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    task = relationship("TaskModel", back_populates="attachments")


class TaskVersionHistory(Base):
    """
    Archive of description or title changes for rollback and auditing.
    """
    __tablename__ = "task_version_history"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    field_name = Column(String(50), nullable=False)  # title, description, priority
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    changed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    task = relationship("TaskModel", back_populates="version_history")


class Checklist(Base):
    """
    Checklist grouping inside a task.
    """
    __tablename__ = "checklists"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), default="Checklist", nullable=False)

    task = relationship("TaskModel", back_populates="checklists")
    items = relationship("ChecklistItem", back_populates="checklist", cascade="all, delete-orphan")


class ChecklistItem(Base):
    """
    Individual checklist item with completion state.
    """
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    checklist_id = Column(Integer, ForeignKey("checklists.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(String(300), nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    checklist = relationship("Checklist", back_populates="items")


class TaskDependency(Base):
    """
    Blocks/Blocked-by relationship between tasks for critical path and Gantt calculation.
    """
    __tablename__ = "task_dependencies"

    id = Column(Integer, primary_key=True, index=True)
    blocking_task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    blocked_task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    dependency_type = Column(String(50), default="BLOCKS", nullable=False)  # BLOCKS, RELATES_TO


class Comment(Base):
    """
    Rich text markdown comment on a task supporting mentions (@user).
    """
    __tablename__ = "task_comments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    task = relationship("TaskModel", back_populates="comments")
    user = relationship("UserModel", back_populates="comments")
    reactions = relationship("EmojiReaction", back_populates="comment", cascade="all, delete-orphan")


class EmojiReaction(Base):
    """
    Emoji reactions on comments.
    """
    __tablename__ = "emoji_reactions"

    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("task_comments.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    emoji = Column(String(20), nullable=False)  # e.g., '👍', '❤️', '🚀'

    comment = relationship("Comment", back_populates="reactions")


class TaskHistory(Base):
    """
    Detailed audit history log for a task.
    """
    __tablename__ = "task_history"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    change_summary = Column(String(250), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    task = relationship("TaskModel", back_populates="history_logs")


class ActivityTimeline(Base):
    """
    Activity timeline entry for real-time notification feed.
    """
    __tablename__ = "activity_timelines"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # COMMENTED, MOVED_COLUMN, ASSIGNED, ATTACHED
    description = Column(String(250), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    task = relationship("TaskModel", back_populates="timeline_events")


class TaskWatcher(Base):
    """
    Users watching a task for notification alerts.
    """
    __tablename__ = "task_watchers"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    task = relationship("TaskModel", back_populates="watchers")


class CustomField(Base):
    """
    Custom field definition per project (TEXT, NUMBER, DATE, SELECT, CHECKBOX).
    """
    __tablename__ = "custom_fields"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    field_type = Column(String(50), default="TEXT", nullable=False)
    options = Column(Text, nullable=True)  # Comma-separated or JSON list for SELECT options

    project = relationship("Project", back_populates="custom_fields")
    values = relationship("CustomFieldValue", back_populates="field", cascade="all, delete-orphan")


class CustomFieldValue(Base):
    """
    Specific value assigned to a custom field on a task.
    """
    __tablename__ = "custom_field_values"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("user_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    field_id = Column(Integer, ForeignKey("custom_fields.id", ondelete="CASCADE"), nullable=False, index=True)
    value_text = Column(Text, nullable=True)

    task = relationship("TaskModel", back_populates="custom_field_values")
    field = relationship("CustomField", back_populates="values")
