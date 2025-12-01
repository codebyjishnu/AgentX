from typing import Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from google.adk.runners import Runner
from google.adk.agents import LlmAgent
from google.adk.sessions import DatabaseSessionService
from google.adk.artifacts import InMemoryArtifactService
from google.genai import types
from google.adk.agents import SequentialAgent
from google.adk.sessions import Session

from app.agent.code_agent import CodeAgent
from app.services.sandbox_service import SandboxService
from app.core.config import settings

class WorkflowService():

    def __init__(self, db: Optional[AsyncSession]) -> None:
        self.db = db
        self.sandbox = SandboxService()
        self.memory_session = DatabaseSessionService(
            db_url=settings.DATABASE_URL,
        )
        self.artifact_service = InMemoryArtifactService()

    async def _init_sandbox(self) -> None:
        await self.sandbox.connect()

    async def _init_config(self, project_id: uuid.UUID):
        return await self.memory_session.create_session(
            app_name="AgentX",
            user_id="user_123",
            session_id=str(project_id),
            state={
                "summary": "",
                "files": {},
            },
        )

    async def _get_session(self, project_id: uuid.UUID) -> Optional[Session]:
        return await self.memory_session.get_session(
            app_name="AgentX",
            user_id="user_123",
            session_id=str(project_id)
        )

    async def _runner(self) -> Runner:
        return Runner(
            app_name="AgentX",
            agent=SequentialAgent(
                name="workflow_agent",
                description="A sequential agent to handle coding workflows.",
                sub_agents=[
                    CodeAgent(sandbox=self.sandbox).agent(),
                ]
            ),
            session_service=self.memory_session,
            # artifact_service=self.artifact_service,
        )
    
    async def execute_workflow(self, project_id: uuid.UUID, message: str):
        session = await self._init_config(project_id)
        await self._init_sandbox()
        runner = await self._runner()
        content = types.Content(role='user', parts=[types.Part(text=message)])

        async for event in runner.run_async(
            user_id="user_123",
            session_id=str(project_id),
            new_message=content,
        ):
            if event.is_final_response():
                break

        url = await self.sandbox.get_sandbox_url()
        session = await self._get_session(project_id)
        if not session:
            raise Exception("Session not found after workflow execution.")
        
        return {
            "summary": session.state.get("summary", ""),
            "files": session.state.get("files", []),
            "sandbox_id": self.sandbox.sandbox.sandbox_id if self.sandbox.sandbox else "",
            "url": url,
        }