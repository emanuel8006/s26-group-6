import os
from typing import Optional
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

def _env_with_fallback(primary: str, fallback: str) -> Optional[str]:
	return os.getenv(primary) or os.getenv(fallback)


SUPABASE_URL: Optional[str] = _env_with_fallback("SUPABASE_URL", "VITE_SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY: Optional[str] = _env_with_fallback(
	"SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"
)
SUPABASE_ANON_KEY: Optional[str] = _env_with_fallback(
	"SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"
)
