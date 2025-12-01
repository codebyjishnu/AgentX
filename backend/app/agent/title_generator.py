


from app.services.sandbox_service import SandboxService
from google.adk.agents import Agent
from google.adk.agents.readonly_context import ReadonlyContext
from google.adk.utils import instructions_utils

from app.agent.prompts import TITLE_PROMPT

class TitleGenerator:
    def __init__(self, sandbox: SandboxService) -> None:
        self.sandbox = sandbox


    async def _get_instruction(self, context: ReadonlyContext) -> str:
        text = await instructions_utils.inject_session_state(TITLE_PROMPT, context)
        print("Generated Title Instruction:", text)
        return text

    def agent(self):
        return Agent(
            name="code_assistant",
            model="gemini-2.5-pro",
            description="A title generator for code fragments.",
            instruction=self._get_instruction,
            output_key="title",
        )
    
    