from typing import Any, Optional, Union
from e2b import AsyncSandbox
from pydantic import BaseModel, Field
from dotenv import load_dotenv
load_dotenv()
class SandboxFile(BaseModel):
    path: str = Field(..., description="The file path in the sandbox.")
    content: str = Field(..., description="The content of the file.")

class SandboxService:

    def __init__(self):
        self.sandbox = None

    async def connect(self, sandbox_id: Optional[str] = None) -> str:
        try:
            if sandbox_id:
                self.sandbox = await AsyncSandbox.connect(sandbox_id)
                return self.sandbox.sandbox_id
            else:
                self.sandbox = await AsyncSandbox.create('agentX-test')
                return self.sandbox.sandbox_id
        except Exception as e:
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
        
    async def check_for_errors(self) -> Optional[str]:
        """Check for any errors in the app. Returns error message or None if no errors."""
        try:
            sandbox = self._get_sandbox()

            process_check = await sandbox.commands.run("lsof -i :3000 | grep LISTEN")
            if not process_check.stdout.strip():
                return "App is not running on port 3000"
            
            build_check = await sandbox.commands.run("npm run build --dry-run 2>&1 || true")
            if "error" in build_check.stdout.lower() or build_check.exit_code != 0:
                return f"Build errors detected: {build_check.stdout}"
            
            ts_check = await sandbox.commands.run("npx tsc --noEmit --skipLibCheck 2>&1 || true")
            if ts_check.exit_code != 0:
                return f"TypeScript errors: {ts_check.stdout}"
            
            return None
            
        except Exception as e:
            return f"Error check failed: {str(e)}"
        
    async def create_or_update_files(self, files: list[Any]) -> Union[list[SandboxFile], str]:
        try:
            new_files: list[SandboxFile] = []
            sandbox = self._get_sandbox()
            for file in files:
                if isinstance(file, dict):
                    file = SandboxFile(**file)
                if file.path.startswith("/"):
                    file.path = file.path[1:]
                await sandbox.files.write(file.path, file.content)
                new_files.append(file)
            return new_files
        except Exception as e:
            return "File write failed: " + str(e)
        
    async def read_files(self, paths: list[str]) -> Union[list[SandboxFile], str]:
        try:
            contents = []
            sandbox = self._get_sandbox()
            for path in paths:
                content = await sandbox.files.read(path)
                contents.append(SandboxFile(path=path, content=content).model_dump())
            return contents
        except Exception as e:
            return "File read failed: " + str(e)
        
    async def list_files(self, path: str = "/home/user/src/"):
        try:
            files = await self._get_sandbox().files.list(path, depth=5)
            return files
        except Exception as e:
            return "File list failed: " + str(e)
    
    async def read_file(self, path: str):
        try:
            content = await self._get_sandbox().files.read(path)
            return content
        except Exception as e:
            return "File read failed: " + str(e)
