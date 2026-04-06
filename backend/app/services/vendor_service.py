"""This file contains the methods to get the vendors on and off campus that accept dining dollars"""
from typing import List, Dict, Any
from app.db.supabase_client import supabase_client

def get_vendors(category: str = None, location_type: str = None) -> List[Dict[str, Any]]:
    """
    Fetches the list of vendors that accept dining dollars, optionally filtered 
    by category and location type.
    Args:
        category (str): Optional category to filter vendors (e.g., "restaurant", "cafe", "grocery")
        location_type (str): Optional location type (e.g., "on-campus", "off-campus")
    Returns:
        JSON: A list of vendor dictionaries with details such as name, category, and location type.
    """
    query = supabase_client.table("vendors").select("*")
    if category:
        query = query.eq("category", category)
    if location_type:
        query = query.eq("location_type", location_type)
    try:
        result = query.execute()
        return result.data if result.data else []
    except Exception as e:
        print(f'Error fetching vendor data: {e}')
        return []
