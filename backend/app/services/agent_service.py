

import uuid
from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import MessageType, Project, Message, MessageRole
from app.schemas.project import ChatRequest

class AgentService():

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_agent_project(self):
        """Create a new project."""
        count = await self.db.execute(select(func.count(Project.id)))
        obj_data = {"name": f"New Project {count.scalar()}"}
        db_obj = Project(**obj_data)
        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)
        await self.db.commit()
        return db_obj

    async def get_project_details(self, project_id: uuid.UUID):
        """Get all messages for a project."""
        # First check if project exists
        stmt = select(Project).where(Project.id == project_id)
        result = await self.db.execute(stmt)
        project = result.scalar_one_or_none()
        
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Fetch messages from Message table where project_id matches
        messages_stmt = select(Message).where(Message.project_id == project_id)
        messages_result = await self.db.execute(messages_stmt)
        messages = messages_result.scalars().all()
        details = {
            "id": project.id,
            "name": project.name,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "messages": messages
        }
        return details
    
    async def _add_message(self, project_id: uuid.UUID, content: str, role: MessageRole, type: MessageType):
        """Add a new message to a project."""
        obj_data = {"content": content, "project_id": project_id, "role": role, "type": type}
        db_obj = Message(**obj_data)
        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)
        await self.db.commit()
        return db_obj

    async def execute_chat(self, project_id: uuid.UUID, chat_request: ChatRequest):
        """Create a new message for a project."""
        # First check if project exists
        stmt = select(Project).where(Project.id == project_id)
        result = await self.db.execute(stmt)
        project = result.scalar_one_or_none()
        
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Add user message
        user_message = await self._add_message(project_id, chat_request.message, MessageRole.USER, MessageType.RESULT)
        # Create new message
     
        result = None
        # TODO: start workflow excution and update message with result
        return result