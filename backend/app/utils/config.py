import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str | None = os.getenv("VITE_SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY: str | None = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
SUPABASE_ANON_KEY: str | None = os.getenv("VITE_SUPABASE_ANON_KEY")
