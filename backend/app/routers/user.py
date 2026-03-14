"""
This file creates an API router that handles user-data related requests. 
Connects to supabase through backend/app/db/supabase_client.py. 
Functions handle account creation, account updates, and account deletion.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Any
from backend.app.db.supabase_client import supabase_client

router = APIRouter(prefix="/user")

async def get_current_user(authorization: str = Header(...)) -> User|Exception:
    """
    Creates fastapi dependency for all of these protected functions
    Aka user must be logged in to use these functions
    """
    token = authorization.replace("Bearer ", "")
    try:
        response = supabase_client.auth.get_user(token)
        return response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.put("/update/")
async def update_user_info(
    user: Any = Depends(get_current_user),
    username: str | None = None,
    email: str | None = None,
    dietary_preferences: list[str] | None = None,
    diet_restrictions: str | None = None
) -> APIResponse|Exception:
    update_dict: dict[str,str|list[str]] = {}

    if username is not None:
        update_dict["username"] = username
    if email is not None:
        update_dict["email"] = email
    if dietary_preferences is not None:
        update_dict["dietary_preferences"] = dietary_preferences
    if diet_restrictions is not None:
        update_dict["diet_type"] = diet_restrictions

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        response = (
            supabase_client.table("profiles")
            .update(update_dict)
            .eq("id", user.id)
            .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))

@router.delete("/delete")
async def delete_user(user: Any = Depends(get_current_user)) -> Exception|APIResponse:
    """
    Deletes user acc based on user_id
    """
    try:
        response = (
        supabase_client.table("profiles")
        .delete()
        .eq("id", user)
        .execute()
        )
        return response
    except Exception as exception:
        return exception
