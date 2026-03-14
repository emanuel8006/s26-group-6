"""
The file defines an API Router for handling menu-related requests.
It imports the necessary modules and functions, including the API Router
from FastAPI and the get_menu function.
The router is prefixed with "/menu", and defines a GET endpoint.
"""
from typing import Dict, Any
from fastapi import APIRouter
from app.services.dineoncampus_service import get_menu

router = APIRouter(prefix="/menu")

@router.get("/")
async def menu(location_id: str, period_id: str) -> Dict[str, Any]:
    """Endpoint to get the menu for a specific location and period."""
    return await get_menu(location_id, period_id)
