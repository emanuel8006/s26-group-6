"""Periodically refreshes and caches DineOnCampus location and period IDs"""
from datetime import date
from typing import Dict, List, Any, Optional
from cachetools import TTLCache
import httpx
from curl_cffi.requests import AsyncSession

from app.services.dineoncampus_service import HEADERS

location_cache: TTLCache = TTLCache(maxsize=10, ttl=86400)  # 24 hour cache

KNOWN_LOCATIONS: Dict[str, str] = {
    "stetson east": "586d05e4ee596f6e6c04b527",
    "international village": "5f4f8a425e42ad17329be131"
}


def get_location_id(location_name: str) -> Optional[str]:
    """Returns the location ID for a given location name. Case insensitive."""
    return KNOWN_LOCATIONS.get(location_name.lower().strip())


async def get_periods(location_id: str) -> List[Dict[str, str]]:
    """
    Fetches valid period IDs for a given location for today.
    Cached for 24 hours.
    """
    cache_key = f"periods-{location_id}-{date.today().isoformat()}"
    if cache_key in location_cache:
        return location_cache[cache_key]

    url = (
        f"https://apiv4.dineoncampus.com/locations/{location_id}/periods/"
        f"?date={date.today().isoformat()}"
    )

#    async with httpx.AsyncClient(headers=HEADERS) as client:
#        try:
#            res = await client.get(url, timeout=10.0)
#            res.raise_for_status()

    async with AsyncSession(impersonate="chrome") as s:
        try:
            res = await s.get(url, headers=HEADERS)
        except httpx.HTTPStatusError as e:
            return {"error": "DineOnCampus API failed", "status": e.response.status_code, "detail": str(e)}
        except httpx.RequestError as e:
            return {"error": "DineOnCampus API request failed", "detail": str(e)}

    data = res.json()
    periods: List[Dict[str, str]] = [
        {
            "id": period.get("id"),
            "name": period.get("name"),
            "slug": period.get("slug")
        }
        for period in data.get("periods", [])
    ]
    location_cache[cache_key] = periods
    return periods


async def get_period_id_by_name(location_id: str, period_name: str) -> Optional[str]:
    """Finds the period ID for a given location and period name."""
    periods = await get_periods(location_id)
    if isinstance(periods, dict) and "error" in periods:
        return "error"
    for period in periods:
        if period.get("name", "").lower() == period_name.lower().strip():
            return period["id"]
    return None
