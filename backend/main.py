import uuid
from fastapi import FastAPI
from app.api.router import router
from fastapi.middleware.cors import CORSMiddleware

from app.services.workflow_service import WorkflowService


app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Success"}

app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_methods=["*"],allow_headers=["*"])

app.include_router(router)
    