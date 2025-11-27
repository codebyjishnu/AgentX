from typing import List
import enum
import uuid
from datetime import datetime
from sqlalchemy import JSON, Enum, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from sqlalchemy.dialects.postgresql import  UUID
from sqlalchemy.sql import func

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass

class MessageRole(str, enum.Enum):
    """Message role enumeration."""

    USER = "USER"
    ASSISTANT = "ASSISTANT"

class MessageType(str, enum.Enum):
    """Message type enumeration."""

    RESULT = "RESULT"
    ERROR = "ERROR"

class Project(Base):
    "Project Model."
    __tablename__ = "projects"
    
    id:  Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        index=True)
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    messages: Mapped[List["Message"]] = relationship("Message", back_populates="project", cascade="all, delete-orphan")

class Message(Base):
    "Message Model."
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        index=True)
    
    content: Mapped[str] = mapped_column(String, nullable=False)
    
    role: Mapped[MessageRole] = mapped_column(
        Enum(MessageRole, name="role"),
        nullable=False,
        index=True,
        default=MessageRole.USER
    )
    type: Mapped[MessageType] = mapped_column(
        Enum(MessageType, name="type"),
        nullable=False,
        index=True,
        default=MessageType.RESULT
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)
    
    # Foreign keys
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id"),
        nullable=False,
        index=True
    )

    # Relationships
    project: Mapped[Project] = relationship("Project",foreign_keys=[project_id])
    fragment: Mapped[List["Fragment"]] = relationship("Fragment", back_populates="message", uselist=False, cascade="all, delete-orphan")


class Fragment(Base):
    "Fragment Model."
    __tablename__ = "fragments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        index=True)
    
    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("messages.id", ondelete="CASCADE"), 
        unique=True, 
        nullable=False,
        index=True
    )    
    sandbox_url: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    files: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    message: Mapped[Message] = relationship("Message", foreign_keys=[message_id])

class Usage(Base):
    """Usage model for tracking API usage."""
    __tablename__ = "usage"
    
    key: Mapped[str] = mapped_column(String, primary_key=True)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    expire: Mapped[str] = mapped_column(String, nullable=True)