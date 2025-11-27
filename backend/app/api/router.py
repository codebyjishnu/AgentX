import uuid
from fastapi import APIRouter, Depends, Query

from app.schemas.project import ProjectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.agent_service import AgentService

router = APIRouter()


@router.get("/project/new", response_model=ProjectResponse, response_model_exclude_none=True, response_model_exclude_unset=True)
async def create_agent_chat_project(
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new chat session for the specified agent.
    """
    service = AgentService(db)
    return await service.create_agent_project()

@router.get("/project/{project_id}/details", response_model=ProjectResponse, response_model_exclude_none=True, response_model_exclude_unset=True)
async def get_project_messages(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
    ):
    """
    Create a new chat session for the specified agent.
    """
    service = AgentService(db)
    return await service.get_project_details(project_id)

@router.post("/project/{project_id}/chat", response_model=ProjectResponse, response_model_exclude_none=True, response_model_exclude_unset=True)
async def create_project_messages(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    message: str = Query(..., description="Message to add to the project", examples=["Hello, how can I help you?"])
):
    """
    Create a new chat session for the specified agent.
    """
    service = AgentService(db)
    return await service.execute_chat(project_id, message)