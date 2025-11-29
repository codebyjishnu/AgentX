
import json
from typing import Callable, Dict, Union
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm # For multi-model support

from app.services.sandbox_service import SandboxService, SandboxFile
from app.agents.system_prompts import PROMPT

class CodeAgent():
    def __init__(self,  new_sandbox: SandboxService, agent_state: dict):
        self.sandbox = new_sandbox
        self.agent_state = agent_state

    async def create_code_agent(self) -> Agent:
        agent = Agent(
            name="code_generator",
            model="gemini-2.5-pro",
            description="You are nextjs coding agent expert.",
            instruction=PROMPT,
            tools=[self._run_terminal, self._create_or_update_files, self._read_files]
        )
        return agent

    async def _run_terminal(self, command: str) -> str:
        print("Tool - _run_terminal: ", command)
        return await self.sandbox.run_command(command)
    
    async def _create_or_update_files(self, files: list[SandboxFile]):
        new_files = await self.sandbox.create_or_update_files(files)
        for file in new_files:
            print("Tool - _create_or_update_files: ", file.path if isinstance(file, SandboxFile) else file["path"] if isinstance(file, dict) and "path" in file else file)
        if isinstance(new_files, list):
            return "Files created/updated successfully. files: " + ", ".join([file.path for file in new_files])
        else:
            return new_files
        
    async def _read_files(self, paths: list[str]):
        print("Tool - _read_files: ", paths)
        contents = await self.sandbox.read_files(paths)
        for content in contents:
            print("Tool - _read_files: ", content if isinstance(content, str) else "Success")
        if isinstance(contents, str):
            return contents
        return json.dumps([content.model_dump() if isinstance(content, SandboxFile) else content for content in contents])