


from app.services.sandbox_service import SandboxService
from google.adk.agents import Agent

from app.agent.prompts import FRAGMENT_TITLE_PROMPT

class TitleGenerator:
    def __init__(self, sandbox: SandboxService) -> None:
        self.sandbox = sandbox

    def agent(self):
        return Agent(
            name="code_assistant",
            model="gemini-2.5-pro",
            description="A title generator for code fragments.",
            static_instruction=FRAGMENT_TITLE_PROMPT,
            output_key="title",
        )
    
    