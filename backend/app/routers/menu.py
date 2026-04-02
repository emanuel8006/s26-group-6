"""
The file defines an API Router for handling menu-related requests.
It imports the necessary modules and functions, including the API Router
from FastAPI and the get_menu function.
The router is prefixed with "/menu", and defines a GET endpoint.
"""
from typing import Dict, List, Any
from fastapi import APIRouter, HTTPException
from app.services.dineoncampus_service import get_menu
from app.services.location_service import get_periods, get_location_id, KNOWN_LOCATIONS

router = APIRouter(prefix="/menu", tags=["menu"])

@router.get("/")
async def menu(location: str, period_name: str) -> Dict[str, Any]:
    """
    Endpoint to get the menu for a specific location and period.
    Params:
        location (str): dining hall location name (e.g., "stetson east", "international village")
        period_name (str): "Breakfast", "Lunch", or "Dinner"
    """
    result = await get_menu(location_name=location, period_name=period_name)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.get("/locations")
async def locations() -> Dict[str, List[str]]:
    """Returns the list of known dining halls (Boston campus)"""
    return {
        "known_locations": list(KNOWN_LOCATIONS.keys())
    }

@router.get("/periods")
async def periods(location: str) -> List[Dict[str, str]]:
    """
    Returns the list of valid meal periods for a given dining hall
    Params:
        location(str): dining hall location name ("stetson east" or "international village")
    """
    location_id = get_location_id(location)
    if not location_id:
        raise HTTPException(status_code=404, detail=f"Unknown location: '{location}'")
    result = await get_periods(location_id)
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=502, detail=result["error"])
    return result
