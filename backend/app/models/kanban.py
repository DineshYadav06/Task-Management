from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class BoardColumn(Base):
    """
    Customizable board columns for Kanban flow (e.g., Backlog, In Progress, Code Review, Done).
    """
    __tablename__ = "board_columns"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    position = Column(Integer, default=1, nullable=False)
    wip_limit = Column(Integer, default=0, nullable=False)  # 0 indicates no limit

    project = relationship("Project", back_populates="columns")
    tasks = relationship("TaskModel", back_populates="column", foreign_keys="TaskModel.column_id")


class WIPLimit(Base):
    """
    WIP limit exceptions or alerts per swimlane/column.
    """
    __tablename__ = "wip_limits"

    id = Column(Integer, primary_key=True, index=True)
    column_id = Column(Integer, ForeignKey("board_columns.id", ondelete="CASCADE"), unique=True, nullable=False)
    max_items = Column(Integer, default=5, nullable=False)
    alert_enabled = Column(Integer, default=1, nullable=False)
