"""
This file creates an API router that handles user-data related requests. 
Connects to supabase through backend/app/db/supabase_client.py. 
Functions handle database updates relating to user information
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Any
from backend.app.db.supabase_client import supabase_client
from backend.app.routers.auth import get_current_user

router = APIRouter(prefix="/user")

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
        .eq("id", user.id)
        .execute()
        )
        return response
    except Exception as exception:
        return exception

@router.post("/update_meal_plan/")
async def create_meal_plan(
    user: Any = Depends(get_current_user),
    swipes_start: int,
    dining_dollars_start :float,
    start_date: str,
    end_date: str,
    swipes_current: int|None = None,
    dining_dollars_current: float|None = None
):
    """
    Adds meal plan info to account
    """
    update_dict: dict[str,str] = {
        "swipes_start":swipes_start,
        "dining_dollars_start":dining_dollars_start,
        "start_date":start_date,
        "end_date":end_date
    }

    if swipes_current:
        update_dict["swipes_current"] = swipes_current
    if dining_dollars_current:
        update_dict["dining_dollars_current"] = dining_dollars_current

    try:
        response = (
            supabase_client.table("profiles")
            .update(update_dict)
            .eq("id",user.id)
            .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))

@router.delete("/delete/")
async def delete_user(user: Any = Depends(get_current_user)):
    try:
        response = (
        supabase_client.table("profiles")
        .delete()
        .eq("id", user.id)
        .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
    
@router.get("/get/")
async def get_user_info(user: Any = Depends(get_current_user)) -> Exception|APIResponse:
    try:
        response = (
        supabase_client.table("profiles")
        .select("*")
        .eq("id",user.id)
        .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
    
@router.get("/get_specific/")
async def get_user_info_specific(
    user: Any = Depends(get_current_user),
    columns: list[str]
    ) -> Exception|APIResponse:
    try:
        response = (
        supabase_client.table("profiles")
        .select(", ".join(columns))
        .eq("id",user.id)
        .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
