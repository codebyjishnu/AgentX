from dataclasses import dataclass
from typing import Dict, Optional, Union
from e2b import AsyncSandbox
from pydantic import BaseModel, Field

class SandboxFile(BaseModel):
    path: str = Field(..., description="Path to the file")
    content: str = Field(..., description="Content of the file")

class SandboxService:

    def __init__(self):
        self.sandbox = None

    async def connect(self, sandbox_id: Optional[str] = None) -> str:
        if sandbox_id:
            self.sandbox = await AsyncSandbox.connect(sandbox_id)
            return self.sandbox.sandbox_id
        else:
            self.sandbox = await AsyncSandbox.create('agentX-test')
            return self.sandbox.sandbox_id
    
    def _get_sandbox(self):
        if not self.sandbox:
            raise Exception("Sandbox not created yet.")
        return self.sandbox
    
    async def get_sandbox_url(self) -> str:
        try:
            host =  self._get_sandbox().get_host(3000) if self.sandbox else None
            return f"http://{host}" if host else ""
        except Exception as e:
            return str(e)
    
    async def run_command(self, command: str) -> str:
        """Terminal command execution."""
        try:
            buffer = {
                "stdout": "",
                "stderr": ""
            }
            result = await self._get_sandbox().commands.run(
                command, 
                on_stdout=lambda data: buffer.update({"stdout": buffer["stdout"] + data}),
                on_stderr=lambda data: buffer.update({"stderr": buffer["stderr"] + data})
                )
            return result.stdout
        except Exception as e:
            return f"Command execution failed: {str(e)}\nStdout: {buffer['stdout']}\nStderr: {buffer['stderr']}"
        
    async def create_or_update_files(self, files: list[Dict]) -> Union[Dict[str, SandboxFile], str]:
        try:
            new_files: Dict[str, SandboxFile] = {}
            sandbox = self._get_sandbox()
            for file in files:
                await sandbox.files.write(file["path"], file["content"])
                new_files[file["path"]] = file["content"]
            return new_files
        except Exception as e:
            return "File write failed: " + str(e)
        
    async def read_files(self, paths: list[str]) -> Union[list[Dict], str]:
        try:
            contents = []
            sandbox = self._get_sandbox()
            for path in paths:
                content = await sandbox.files.read(path)
                contents.append(SandboxFile(path=path, content=content).model_dump())
            return contents
        except Exception as e:
            return "File read failed: " + str(e)

