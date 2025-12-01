import uuid
from fastapi import FastAPI
from app.api.router import router
from fastapi.middleware.cors import CORSMiddleware

from app.services.workflow_service import WorkflowService


app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Success"}

app.include_router(router)


async def main():
    from dotenv import load_dotenv
    load_dotenv()
    obj = WorkflowService(db=None)
    user_input = "Create a simple nextjs landing page"
    await obj.execute_workflow(uuid.uuid4(), user_input)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
    