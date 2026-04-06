"""Vendors Router for handling vendor-related API endpoints"""
from typing import Dict, List, Any, Optional
from fastapi import APIRouter
from app.services.vendor_service import get_vendors

router = APIRouter(prefix="/vendors", tags=["vendors"])

@router.get("/")
async def vendor(
    category: Optional[str] = None,
    location_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Fetches the list of vendors using get_vendors service"""
    return get_vendors(category=category, location_type=location_type)
