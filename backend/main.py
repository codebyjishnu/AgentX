from fastapi import FastAPI

from app.workflows.code_workflow import CodeWorkflow

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Success"}

async def main():
    obj = CodeWorkflow("ieeolityr8w9yabe9qm5g")
    user_input = "create an instagram clone with dummy data"
    await obj.execute_code_workflow("test", user_input, None)

if __name__ == "__main__":
   import asyncio
   asyncio.run(main()) 
