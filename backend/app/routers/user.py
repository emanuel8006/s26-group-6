"""
This file creates an API router that handles user-data related requests. 
Connects to supabase through backend/app/db/supabase_client.py. 
Functions handle database updates relating to user information
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Any
from app.db.supabase_client import supabase_client
from app.routers.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/user", tags=["user"])

class user_info_request(BaseModel):
    username: str | None = None
    email: str | None = None


@router.put("/update_user_info")
async def update_user_info(body: user_info_request, user=Depends(get_current_user)):
    update_dict: dict = {}

    if body.username is not None:
        update_dict["username"] = body.username
    if body.email is not None:
        update_dict["email"] = body.email

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

@router.delete("/delete")
async def delete_user():
    data = supabase_client.auth.get_user()
    """
    Deletes user acc based on user_id
    """
    try:
        response = (
            supabase_client.table("users")
            .delete()
            .eq("id", data.user.id)
            .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


class meal_plan_request(BaseModel):
    swipes_start: int | None
    dining_dollars_start: float | None
    start_date: str | None = None
    end_date: str | None = None
    swipes_current: int | None = None
    dining_dollars_current: float | None = None
    plan_name: str | None = None
    swipes_per_week: int | None = None
    dollars_per_week: float | None = None
    offdays: list[str] | None = None
    dietary_preferences: list[str] | None = None
    dietary_restrictions: list[str] | None = None


@router.post("/update_meal_plan")
async def create_meal_plan(body: meal_plan_request, user=Depends(get_current_user)):
    """
    Adds meal plan info to account
    """
    update_dict: dict[str,str] = {}

    if body.swipes_start is not None:
        update_dict["swipes_start"] = body.swipes_start
    if body.dining_dollars_start is not None:
        update_dict["dining_dollars_start"] = body.dining_dollars_start
    if body.start_date is not None:
        update_dict["start_date"] = body.start_date
    if body.end_date is not None:
        update_dict["end_date"] = body.end_date
    if body.swipes_current is not None:
        update_dict["swipes_current"] = body.swipes_current
    if body.dining_dollars_current is not None:
        update_dict["dining_dollars_current"] = body.dining_dollars_current
    if body.plan_name is not None:
        update_dict["plan_name"] = body.plan_name
    if body.swipes_per_week is not None:
        update_dict["swipes_per_week"] = body.swipes_per_week
    if body.dollars_per_week is not None:
        update_dict["dollars_per_week"] = body.dollars_per_week
    if body.offdays is not None:
        update_dict["offdays"] = body.offdays
    if body.dietary_preferences is not None:
        update_dict["dietary_preferences"] = body.dietary_preferences
    if body.dietary_restrictions is not None:
        update_dict["dietary_restrictions"] = body.dietary_restrictions

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        response = (
            supabase_client.table("meal_plans")
            .update(update_dict)
            .eq("id", user.id)
            .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))


@router.get("/get/")
async def get_user_info():
    data = supabase_client.auth.get_user()
    try:
        response = (
            supabase_client.table("users")
            .select("*")
            .eq("id", data.user.id)
            .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))

@router.get("/get_data/")
async def get_user_info_specific(
    column_list: list[str] = Query(...),
    table_name: str = Query(...),
    user=Depends(get_current_user)
):
    try:
        response = (
        supabase_client.table(table_name)
        .select(", ".join(column_list))
        .eq("id", user.id)
        .execute()
        )
        return response
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
