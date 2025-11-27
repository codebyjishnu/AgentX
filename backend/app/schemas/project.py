from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid

from pydantic import BaseModel, Field

class ProjectResponse(BaseModel):
    """Response schema for an agent session."""
    id: uuid.UUID = Field(..., description="ID of the session", examples=[str(uuid.uuid4())])
    name: Optional[str] = Field(None, description="Name of the session", examples=["Support Session"])
    created_at: datetime = Field(..., description="Timestamp when the session was created", examples=["2024-06-01T12:00:00Z"])
    updated_at: datetime = Field(..., description="Timestamp when the session was last updated", examples=["2024-06-02T15:30:00Z"])

    class Config:
        from_attributes = True

# class MeassageResponse(BaseModel):
#     """Response schema for an agent session."""
#     id: uuid.UUID = Field(..., description="ID of the session", examples=[str(uuid.uuid4())])
#     project_id: uuid.UUID = Field(..., description="ID of the project", examples=[str(uuid.uuid4())])
#     role: str = Field(..., description="Role of the message", examples=["user", "agent"])
#     content: str = Field(..., description="Content of the message", examples=["Hello, how can I help you?"])
#     created_at: datetime = Field(..., description="Timestamp when the session was created", examples=["2024-06-01T12:00:00Z"])

# class MessageRequest(BaseModel):
#     """Request schema for an agent session."""
#     role: str = Field(..., description="Role of the message", examples=["user", "agent"])
#     content: str = Field(..., description="Content of the message", examples=["Hello, how can I help you?"])
#     project_id: uuid.UUID = Field(..., description="ID of the project", examples=[str(uuid.uuid4())])
