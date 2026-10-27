"""
db.py
Initializes and exports the Supabase client singleton.
All other modules should import `supabase` from here.
"""

import os
from urllib.parse import urlparse, urlunparse
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_raw_url: str = os.environ["SUPABASE_URL"]
SUPABASE_KEY: str = os.environ["SUPABASE_KEY"]

# Normalize URL: the supabase-py client requires only the project base URL
# (e.g. https://<id>.supabase.co) — strip any trailing path like /rest/v1/
_parsed = urlparse(_raw_url)
SUPABASE_URL: str = urlunparse(_parsed._replace(path="", query="", fragment=""))

# Singleton Supabase client — reused across the app lifecycle
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
