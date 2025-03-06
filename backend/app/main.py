from fastapi import FastAPI
from .endpoints import weather

app = FastAPI()

app.include_router(weather.router, prefix="/weather", tags=["weather"])
