from fastapi import FastAPI
from app.routers import menu, auth

app = FastAPI()

app.include_router(menu.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Oasis dineoncampus API running"}
