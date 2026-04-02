"""
This file creates an API router that handles user-data related requests. 
Connects to supabase through backend/app/db/supabase_client.py. 
Functions handle database updates relating to user information
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Any
from app.db.supabase_client import supabase_client
from app.routers.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/user", tags=["user"])

@router.put("/update")
async def update_user_info(
    username: str | None = None,
    email: str | None = None,
    dietary_preferences: list[str] | None = None,
    diet_restrictions: str | None = None,
    user: Any = Depends(get_current_user)
):
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
            supabase_client.table("users")
            .update(update_dict)
            .eq("id", user.id)
            .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))

class meal_plan_request(BaseModel):
    swipes_start: int|None
    dining_dollars_start: float|None
    start_date: str|None = None
    end_date: str|None = None
    swipes_current: int|None = None
    dining_dollars_current: float|None = None
    plan_name: str|None = None

@router.post("/update_meal_plan")
async def create_meal_plan(
    body: meal_plan_request,
    user: Any = Depends(get_current_user)
):
    """
    Adds meal plan info to account
    """

    update_dict: dict[str,str] = {}

    if body.swipes_start:
        update_dict["swipes_start"] = body.swipes_start
    if body.dining_dollars_start:
        update_dict["dining_dollars_start"] = body.dining_dollars_start
    if body.start_date:
        update_dict["start_date"] = body.start_date
    if body.end_date:
        update_dict["end_date"] = body.end_date
    if body.swipes_current:
        update_dict["swipes_current"] = body.swipes_current
    if body.dining_dollars_current:
        update_dict["dining_dollars_current"] = body.dining_dollars_current
    if body.plan_name:
        update_dict["plan_name"] = body.plan_name

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        response = (
            supabase_client.table("meal_plans")
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
        supabase_client.table("users")
        .delete()
        .eq("id", user.id)
        .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
    
@router.get("/get/")
async def get_user_info(user: Any = Depends(get_current_user)):
    try:
        response = (
        supabase_client.table("users")
        .select("*")
        .eq("id",user.id)
        .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
    
@router.get("/get_specific/")
async def get_user_info_specific(
    columns: list[str],
    user: Any = Depends(get_current_user)
    ):
    try:
        response = (
        supabase_client.table("users")
        .select(", ".join(columns))
        .eq("id",user.id)
        .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
