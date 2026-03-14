"""
Defines an API Router for authentication endpoints backed by Supabase Auth.
Endpoints: register, login, logout, and get current user (me).
"""
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from app.db.supabase_client import supabase_client

router = APIRouter(prefix="/auth")


class AuthRequest(BaseModel):
    email: str
    password: str


def _extract_bearer_token(authorization: str) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return token


def get_current_user(authorization: str = Header(...)):
    """Reusable dependency to resolve the logged-in user from a Bearer token."""
    token = _extract_bearer_token(authorization)
    response = supabase_client.auth.get_user(token)
    if response.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return response.user


@router.post("/register")
def register(body: AuthRequest):
    """Register a new user with email and password."""
    response = supabase_client.auth.sign_up(
        {"email": body.email, "password": body.password}
    )
    if response.user is None:
        raise HTTPException(status_code=400, detail="Registration failed")
    return {"user": response.user}


@router.post("/login")
def login(body: AuthRequest):
    """Log in with email and password, returning a session token and user."""
    response = supabase_client.auth.sign_in_with_password(
        {"email": body.email, "password": body.password}
    )
    if response.session is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": response.session.access_token,
        "token_type": "bearer",
        "user": response.user,
    }


@router.post("/logout")
def logout():
    """Sign out the currently authenticated user."""
    supabase_client.auth.sign_out()
    return {"message": "Logged out successfully"}


@router.get("/me")
def me(user=Depends(get_current_user)):
    """Return the user associated with the Authorization: Bearer token."""
    return {"user": user}
