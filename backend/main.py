from fastapi import FastAPI
from app.api.router import router
from fastapi.middleware.cors import CORSMiddleware

from app.workflows.code_workflow import CodeWorkflow

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Success"}

app.include_router(router)


async def main():
    obj = CodeWorkflow()
    user_input = "Build a Netflix-style homepage with a hero banner (use a nice, dark-mode compatible gradient here), movie sections, responsive cards, and a modal for viewing details using mock data and local state. Use dark mode, use actual images for the placeholders."
    await obj.execute_code_workflow("Test", user_input, None)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
    