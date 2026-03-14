from fastapi import FastAPI
from app.routers import menu

app = FastAPI()

app.include_router(menu.router)

@app.get("/")
def root():
    return {"message": "Oasis dineoncampus API running"}
