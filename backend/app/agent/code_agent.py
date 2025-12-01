import json
from app.agent.prompts import PROMPT
from app.services.sandbox_service import SandboxService, SandboxFile
from google.adk.agents import Agent
from google.adk.tools import ToolContext


class CodeAgent:

    def __init__(self, sandbox: SandboxService) -> None:
        self.sandbox = sandbox

    def agent(self):
        return Agent(
            name="code_assistant",
            model="gemini-2.5-pro",
            description="A nextjs coding assistant that helps create and manage code files in a sandboxed environment.",
            static_instruction=PROMPT,
            tools=[self._run_terminal, self._create_or_update_files, self._read_files],
            output_key="summary",
        )
    
    async def _run_terminal(self, command: str) -> str:
        return await self.sandbox.run_command(command)
    
    async def _create_or_update_files(self, files: list[SandboxFile], tool_context: ToolContext):
        new_files = await self.sandbox.create_or_update_files(files)
        if isinstance(new_files, list):
            tool_context.state["files"] = {file.path: file.content for file in new_files}
            return "Files created/updated successfully. files: " + ", ".join([file.path for file in new_files])
        else:
            return new_files
    
    async def _read_files(self, paths: list[str]):
        contents = await self.sandbox.read_files(paths)
        if isinstance(contents, str):
            return contents
        return json.dumps([content.model_dump() if isinstance(content, SandboxFile) else content for content in contents])
        
        