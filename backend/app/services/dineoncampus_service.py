"""DineOnCampus API integration for frontend menu fetching"""
from datetime import date
from typing import Dict, Any, List
from cachetools import TTLCache
import httpx
from curl_cffi.requests import AsyncSession

menu_cache: TTLCache = TTLCache(maxsize=100, ttl=3600)

STEAST_LOC_ID = "586d05e4ee596f6e6c04b527"
IV_LOC_ID = "5f4f8a425e42ad17329be131"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
    "Referer": "https://new.dineoncampus.com/",
    "Origin": "https://new.dineoncampus.com",
    "sec-ch-ua": '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"MacOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
}

# Nutrients we care about — maps API name -> short key
NUTRIENT_MAP = {
    "Calories":               "calories",
    "Protein (g)":            "protein",
    "Total Carbohydrates (g)":"carbs",
    "Total Fat (g)":          "fat",
    "Saturated Fat (g)":      "sat_fat",
    "Trans Fat (g)":          "trans_fat",
    "Dietary Fiber (g)":      "fiber",
    "Sugar (g)":              "sugar",
    "Sodium (mg)":            "sodium",
    "Cholesterol (mg)":       "cholesterol",
    "Potassium (mg)":         "potassium",
    "Calcium (mg)":           "calcium",
    "Iron (mg)":              "iron",
    "Calories From Fat":      "calories_from_fat",
}

# Filters that are dietary tags (icon=True typically) vs allergens
DIETARY_TAGS = {"Vegetarian", "Vegan", "Good Source of Protein", "Halal", "Gluten Free"}


def parse_numeric(value) -> Any:
    """Try to parse a nutrient value as a float, fallback to the raw string."""
    if value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return str(value)


async def get_menu(location_name: str, period_name: str) -> Dict[str, Any]:
    """"
    This function fetches the menu for a given location and period from the DineOnCampus API.
    Caches and returns the parsed menu data, or an error message if fetching/parsing fails.
    Args:
        -location_name (str): dining hall name ("stetson east" or "international village")
    """
    from app.services.location_service import get_location_id, get_period_id_by_name

    location_id = get_location_id(location_name)
    if not location_id:
        return {
            "error": f"Unrecognized location name: {location_name}",
            "known_locations": ["stetson east", "international village"]
        }

    period_id = await get_period_id_by_name(location_id, period_name)
    if not period_id:
        return {
            "error": f"Period '{period_name}' not found for today at {location_name}",
            "hint": "The menu may not be published yet, or the period name may be misspelled."
        }

    cache_key = f"{location_id}-{period_id}-{get_date()}"
    if cache_key in menu_cache:
        return menu_cache[cache_key]

    url = (
        f"https://apiv4.dineoncampus.com/locations/{location_id}/menu"
        f"?date={get_date()}&period={period_id}"
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

    data: Dict[str, Any] = res.json()
    per_data = data.get("period") or {}
    if not per_data:
        return {"error": "No period data found in the response"}

    categories = per_data.get("categories", [])
    if not categories:
        return {
            "error": "No categories found — menu may not be published yet",
            "period_id": period_id,
            "date": get_date()
        }

    stations: List[Dict[str, Any]] = []
    for category in categories:
        station_items: List[Dict[str, Any]] = []
        for item in category.get("items", []):
            # Parse nutrients into a flat dict
            nutrients = {}
            for n in item.get("nutrients", []):
                key = NUTRIENT_MAP.get(n.get("name"))
                if key:
                    nutrients[key] = parse_numeric(n.get("valueNumeric"))

            # Split filters: icon=True -> dietary tags, *-suffix -> major allergens, else -> allergen/ingredient
            filters = item.get("filters", [])
            tags = [f["name"] for f in filters if f.get("icon") is True]
            allergens_major = [f["name"].replace("*","") for f in filters if not f.get("icon") and f["name"].endswith("*")]
            allergens = [f["name"] for f in filters if not f.get("icon") and not f["name"].endswith("*")]

            station_items.append({
                "name":        item.get("name", "Unknown Item"),
                "description": item.get("desc") or None,
                "calories":    item.get("calories", "N/A"),
                "portion":     item.get("portion", "N/A"),
                "ingredients": item.get("ingredients") or None,
                "nutrients":   nutrients,
                "tags":        tags,
                "allergens":   allergens,
                "allergens_major": allergens_major,
            })

        stations.append({
            "station": category.get("name", "Unknown Station"),
            "items": station_items
        })

    result = {
        "status": data.get("status", {}),
        "stations": stations
    }
    menu_cache[cache_key] = result
    return result


def get_date() -> str:
    """Returns today's date in ISO format"""
    return date.today().isoformat()
