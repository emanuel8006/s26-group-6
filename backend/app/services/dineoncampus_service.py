"""
This file asynchronously fetches and parses data from the DineOnCampus API.
It provides functions to retrieve the menu for a specific location and data.
It returns the menus data as a JSON object that contains the the name of the station and the items, 
which include information such as the name of the food, the calories, and the portion size.
"""
from datetime import date
from typing import Dict, Any, List
from cachetools import TTLCache
import httpx

menu_cache: TTLCache = TTLCache(maxsize=100, ttl=600) # Cache with a time-to-live of 10 minutes

STEAST_LOC_ID = "586d05e4ee596f6e6c04b527" # Stetson East dining hall Location ID
IV_LOC_ID = "5f4f8a425e42ad17329be131" # International Village dining hall Location ID

# Need heders to prevent Status Code 403 from DineOnCampus API
HEADERS = {
    "User-Agent" : (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
    "Referer": "https://new.dineoncampus.com/",
    "Origin": "https://new.dineoncampus.com",
    "sec-ch-ua": '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",

}

async def get_menu(location_id: str, period_id: str) -> dict[str, Any]:
    """
    Gets the menu for a specific location and date from the dineoncampus API.
    Args:
         location_id (str): The ID of the location to get the menu for.
         period_id (str): The ID of the period to get the menu for (e.g., Breakfast, Lunch, Dinner).
    Returns:
        dict: the menu data as a JSON object that containes stations and items.
                On failure, returns a JSON object with an error message and the status code.
    """
    cache_key = f"{location_id}-{period_id}-{get_date()}"

    if cache_key in menu_cache:
        return menu_cache[cache_key]

    url = (
        f"https://apiv4.dineoncampus.com/locations/{location_id}/menu"
        f"?date={get_date()}&period={period_id}"
    )

    async with httpx.AsyncClient(headers=HEADERS) as client:
        try:
            res = await client.get(url, timeout=10.0)
            res.raise_for_status()
        except httpx.HTTPStatusError as e:
            # To detect a non-200 status code (4xx or 5xx error)
            return {
                "error": "DineOnCampus API failed",
                "status": e.response.status_code,
                "detail": str(e)
            }
        except httpx.RequestError as e:
            # To detect a network error or timeout
            return {
                "error" : "DineOnCampus API request failed",
                "detail" : str(e)
            }

    data = res.json()
    print("RAW API RESPONSE:", data)
    per_data = data.get("period") or {}
    if not per_data:
        return {
            "error": "No period data found in the response", "raw" : data
        }
    categories = per_data.get("categories", [])
    if not categories:
        return {
            "error": "No categories found for this period — menu may not be published yet",
            "period_id": period_id,
            "date": get_date()
        }

    stations: List[Dict[str, Any]] = [] # Holds the stations and their menu items

    for category in categories:
        # Holds the name of the station, default is unknown
        station_name = category.get("name", "Unknown Station")

        station_items: List[Dict[str, Any]] = [] # Stores the menu items for the station
        for item in category.get("items", []): # Loop through each menu item in the station
            station_items.append({
                "name": item.get("name", "Unknown Item"),
                "calories": item.get("calories", "N/A"),
                "portion": item.get("portion", "N/A")
            })

        stations.append({
            "station": station_name,
            "items": station_items
        })
    result = {
        "status" : data.get("status", {}),
        "stations": stations
    }
    menu_cache[cache_key] = result # Cache result for future
    return result

def get_date() -> str:
    """
    Returns the current date in ISO format (YYY-MM-DD).
    """
    return date.today().isoformat()
