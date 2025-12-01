from enum import Enum
import json
import time
from typing import Any, Dict, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from google.adk.runners import Runner
from google.adk.sessions import DatabaseSessionService
from google.genai import types
from google.adk.agents import SequentialAgent
from google.adk.sessions import Session

from app.agent.code_agent import CodeAgent
from app.models.database import Project
from app.services.sandbox_service import SandboxService
from app.core.config import settings
from app.agent.title_generator import TitleGenerator

class ActionType(str, Enum):
    MESSAGE = "message"
    FILE_WRITE = "file_write"
    FILE_READ= "file_read"
    TERMINAL = "terminal"
    COMPLETE = "complete"
    ERROR = "error"

class WorkflowService():

    def __init__(self, db: Optional[AsyncSession]) -> None:
        self.db = db
        self.sandbox = SandboxService()
        self.memory_session = DatabaseSessionService(
            db_url=settings.DATABASE_URL,
        )

    async def _init_sandbox(self, session_id: Optional[str]):
        return await self.sandbox.connect(session_id)

    async def _init_config(self, project_id: uuid.UUID):
        session = await self._get_session(project_id)
        if session:
            return session
        else:
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
                    TitleGenerator(sandbox=self.sandbox).agent(),
                ]
            ),
            session_service=self.memory_session,
            # artifact_service=self.artifact_service,
        )
    
    async def execute_workflow(self, project: Project, message: str):
        session = await self._init_config(project.id)
        sandbox_id = await self._init_sandbox(project.sandbox_id)
        if project.sandbox_id != sandbox_id:
            await self._update_sandbox_id(project, sandbox_id)
        runner = await self._runner()
        content = types.Content(role='user', parts=[types.Part(text=message)])

        async for event in runner.run_async(
            user_id="user_123",
            session_id=str(project.id),
            new_message=content,
        ):
            try:
                # Extract tool name from function call or response
                tool_name = "Unknown"
                event_fun = event.get_function_calls()
                if event_fun and len(event_fun) > 0:
                    tool_name = event_fun[0].name
                    args = event_fun[0].args or {}
                    match tool_name:
                        case "_create_or_update_files":
                            files = args.get("files", [])
                            file_paths = [file.get("path") for file in files]
                            yield self._create_event(ActionType.FILE_WRITE, "Updating files...", data={"files": file_paths})
                        case "_read_files":
                            yield self._create_event(ActionType.FILE_READ, "Reading files...", data={"files": args.get("paths", [])})
                        case "_run_terminal":
                            yield self._create_event(ActionType.TERMINAL, "Executing terminal command...", data={"command": args.get("command", "")})
                        case _:
                            yield self._create_event(ActionType.MESSAGE, "Thinking...")
                if event.is_final_response():
                    break
            except Exception as e:
                yield self._create_event(ActionType.ERROR, "Error: " + str(e))

        url = await self.sandbox.get_sandbox_url()
        session = await self._get_session(project.id)
        if not session:
            raise Exception("Session not found after workflow execution.")
        
        yield self._create_event(ActionType.COMPLETE, "Task completed.", data= {
            "title": session.state.get("title", ""),
            "summary": session.state.get("summary", "").replace("<task_summary>", "").replace("</task_summary>", ""),
            "files": session.state.get("files", []),
            "sandbox_id": self.sandbox.sandbox.sandbox_id if self.sandbox.sandbox else "",
            "url": url,
        })


    def _create_event(
        self,
        action: ActionType,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a Server-Sent Event with structured action data."""
        event_data = {
            "action": action.value,
            "message": message,
            "timestamp": time.time(),
        }
        if data:
            event_data["data"] = data
        return f"data: {json.dumps(event_data)}\n\n"
    
    async def _update_sandbox_id(self, project: Project, sandbox_id: str) -> None:
        """Update the project's sandbox_id in the database."""
        if self.db is None:
            raise Exception("Database session is not available.")
        project.sandbox_id = sandbox_id
        self.db.add(project)
        await self.db.commit()