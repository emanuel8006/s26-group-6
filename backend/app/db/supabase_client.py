"""
This file creates an instance of the Supabase client that can be imported and used in other files.
"""
import sys
from supabase import create_client, Client
from app.utils.config import SUPABASE_URL, SUPABASE_ANON_KEY

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
