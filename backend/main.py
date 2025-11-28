from fastapi import FastAPI
from app.api.router import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Success"}

app.include_router(router)