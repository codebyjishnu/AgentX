from fastapi import FastAPI
from app.api.router import router

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Success"}

app.include_router(router)