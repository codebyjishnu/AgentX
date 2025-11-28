from fastapi import FastAPI
# from app.api.router import router
from app.workflows.code_workflow import CodeWorkflow

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Success"}

# app.include_router(router)


async def main():
    
    obj = CodeWorkflow("ipnd7l0ik8aqjr5epe2mf")
    user_input = "Creaate Netflix clone with dummy data"
    await obj.execute_code_workflow("test", user_input, None)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())