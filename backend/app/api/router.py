import uuid
from fastapi import APIRouter, Depends, Query
from pydantic import Field

from app.schemas.project import ChatRequest, ProjectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.agent_service import AgentService
from app.services.sandbox_service import SandboxService

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

@router.post("/project/{project_id}/chat", response_model_exclude_none=True, response_model_exclude_unset=True)
async def create_project_messages(
    project_id: uuid.UUID,
    message: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new chat session for the specified agent.
    """
    service = AgentService(db)
    return await service.execute_chat(project_id, message)


@router.get("/sandbox/{sandbox_id}/list_files", response_model_exclude_none=True, response_model_exclude_unset=True)
async def list_files(
    sandbox_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    List all files in the sandbox.
    """
    service = SandboxService()
    await service.connect(sandbox_id)
    return await service.list_files()

@router.get("/sandbox/{sandbox_id}/{path:path}", response_model_exclude_none=True, response_model_exclude_unset=True)
async def read_file(
    sandbox_id: str,
    path: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Read a file from the sandbox.
    """
    service = SandboxService()
    await service.connect(sandbox_id)
    return await service.read_file(path)
