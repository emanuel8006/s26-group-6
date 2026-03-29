"""
This file creates a router that handles data analysis requests, and outputs json data
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Any
from backend.app.db.supabase_client import supabase_client
from backend.app.routers.auth import get_current_user
from backend.app.routers.user import get_user_info
from datetime import datetime

router = APIRouter(prefix="/analysis")

@router.post("/meal_plan")
def analyze_meal_plan(user: Any = Depends(get_current_user)):
    """
    Analyses user's meal plan, returns dict (that maybe will get converted to json)
    which has keys:
    dd_overspending: bool
    dd_spent_per_day: float
    dd_end_expected: float
    sw_overspending: bool
    sw_spent_per_day: int
    sw_end_expected: int
    """
    data = Depends(get_user_info)
    data = data[0]
    date_pattern = "%Y-%m-%d"
    current_date = datetime.date.today()
    try:
        dining_dollars_start = int(data["dining_dollars_current"])
        dining_dollars_current = int(data["dining_dollars_current"])
        swipes_start = int(data["swipes_start"])
        swipes_current = int(data["swipes_current"])
        start_date = datetime.strptime(str(data["start_date"]), date_pattern)
        end_date = datetime.strptime(str(data["end_date"]), date_pattern)
    except Exception as exception:
        raise HTTPException(status_code=500, detail=str(exception))
    
    total_duration = end_date - start_date
    current_duration = current_date - start_date
    dining_dollars_change = dining_dollars_start - dining_dollars_current
    swipes_change = swipes_start - swipes_current
    
    dd_spent_per_day = dining_dollars_change/current_duration
    dd_end_expected = dd_spent_per_day * total_duration
    if dd_end_expected > dining_dollars_start:
        dd_overspending = True
    else:
        dd_overspending = False

    sw_spent_per_day = swipes_change/current_duration
    sw_end_expected = sw_spent_per_day * total_duration
    if sw_end_expected > swipes_start:
        sw_overspending = True
    else:
        sw_overspending = False

    return {"dd_overspending":dd_overspending,
            "dd_spent_per_day":dd_spent_per_day,
            "dd_end_expected":dd_end_expected,
            "sw_overspending":sw_overspending,
            "sw_spent_per_day":sw_spent_per_day,
            "sw_end_expected":sw_end_expected}
