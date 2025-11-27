
from typing import Any, Dict, Optional
from requests import Session

from app.services.sandbox_service import SandboxService
from app.agents.code_agent import CodeAgent

import os
import asyncio
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm # For multi-model support
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types # For creating message Content/Parts


class CodeWorkflow:

    def __init__(self, sandbox_id: Optional[str] = None):
        self.sandbox_id = sandbox_id
        self.sandbox_service = SandboxService()
        self.prject_id = None
        self.user_message = None
        self.db = None

    async def execute_code_workflow(
        self,
        project_id: Optional[str],
        user_message: str,
        db: Optional[Session],
    ) -> Dict[str, Any]:
        """
        Execute the code generation workflow.
        
        This workflow:
        1. Creates a new E2B sandbox
        2. Initializes a code agent with tools for sandbox interaction
        3. Runs the agent with the user message
        4. Returns the sandbox URL, generated files, and task summary
        
        Args:
            project_id: Project ID
            user_message: User message/request
            db: Database session
            
        Returns:
            Dictionary with sandbox URL, files, and summary
        """
        # Create sandbox
        sandbox_id =await self.sandbox_service.connect(self.sandbox_id)
        print(f"Sandbox created: {sandbox_id}")

        # Get previous messages for context
        previous_messages = "ghgvvjj"

        # Step 3: Initialize agent state
        agent_state = {
        "summary": "",
        "files": {},
    }   
        # InMemorySessionService is simple, non-persistent storage for this tutorial.
        session_service = InMemorySessionService()
        # Define constants for identifying the interaction context
        APP_NAME = "agentx app"
        USER_ID = "user_1"
        SESSION_ID = "session_001" # Using a fixed ID for simplicity

        # Create the specific session where the conversation will happen
        session = await session_service.create_session(
            app_name=APP_NAME,
            user_id=USER_ID,
            session_id=SESSION_ID
        )
        print(f"Session created: App='{APP_NAME}', User='{USER_ID}', Session='{SESSION_ID}'")

        # Step 4: Create the agent
        code_agent_obj = CodeAgent(self.sandbox_service, agent_state)
        code_agent = await code_agent_obj.create_code_agent()
        print(f"Agent created: {code_agent.name}")
        # --- Runner ---
        # Key Concept: Runner orchestrates the agent execution loop.
        runner = Runner(
            agent=code_agent, # The agent we want to run
            app_name=APP_NAME,   # Associates runs with our app
            session_service=session_service # Uses our session manager
        )
        print(f"Runner created for agent '{runner.agent.name}'.")

        final_response_text = "Agent did not produce a final response."
        # --- Run the agent ---
        async for event in runner.run_async(
            user_id=USER_ID,
            session_id=SESSION_ID,
            new_message=types.Content(
                role='user', parts=[types.Part(text=user_message)]
            ),
        ):
            if event.is_final_response():
                if event.content and event.content.parts:
                    # Assuming text response in the first part
                    final_response_text = event.content.parts[0].text
                elif event.actions and event.actions.escalate: # Handle potential errors/escalations
                    final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
                # Add more checks here if needed (e.g., specific error codes)
                break # Stop processing events once the final response is found

        print(f"<<< Agent Response: {final_response_text}")
        sandbox_url = await self.sandbox_service.get_sandbox_url()
        print(f"Sandbox URL: {sandbox_url}")
            
            
        return {}