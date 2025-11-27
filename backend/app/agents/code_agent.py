
from typing import Callable, Dict, Union
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm # For multi-model support

from app.services.sandbox_service import SandboxService, SandboxFile
from app.agents.system_prompts import PROMPT

class CodeAgent():
    def __init__(self,  new_sandbox: SandboxService, agent_state: dict):
        self.sandbox = new_sandbox
        self.agent_state = agent_state
        # self.agent = Agent(
        #     name="code_generator",
        #     model="gemini-2.0-flash",
        #     instruction="You are an expert coding agent.",
        #     tools=[self._run_command]
        # )
        

    async def create_code_agent(self) -> Agent:
        agent = Agent(
            name="code_generator",
            model="gemini-2.5-flash",
            description="You are nextjs coding agent expert.",
            instruction=PROMPT,
            tools=[self._run_command, self._create_or_update_files, self._read_files]
        )
        return agent

    async def _run_command(self, command: str) -> str:
        """Run a command in the sandbox."""
        try:
            print("Tool call")
            print(f"Running command: {command}")
            return await self.sandbox.run_command(command)
        except Exception as e:
            return f"Command execution failed: {str(e)}"
    

    async def _create_or_update_files(self, files: list[SandboxFile]) -> Union[Dict[str, SandboxFile], str]:
        """Create or update files in the sandbox."""
        try:
            print("Tool call", len(files))
            result = await self.sandbox.create_or_update_files(files)
            isinstance(result, dict)
            return result
        except Exception as e:
            return "File write failed: " + str(e)

    async def _read_files(self, paths: list[str]) -> Union[list[SandboxFile], str]:
        """Read files from the sandbox."""
        try:
            result = await self.sandbox.read_files(paths)
            isinstance(result, list)
            return result
        except Exception as e:
            return "File read failed: " + str(e)