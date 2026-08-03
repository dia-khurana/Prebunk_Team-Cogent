"""
Centralized configuration, read from environment variables where relevant.
Keeping this separate means deployment settings (DB path, CORS origins)
never need to be hunted for inside business logic.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# SQLite file location. On Render's free tier, disk is ephemeral across
# deploys but persists across requests within a running instance — fine
# for a hackathon demo. For real production, swap DB_PATH logic for a
# managed Postgres connection string (see README "Scaling beyond the demo").
DB_PATH = Path(os.getenv("PREBUNK_DB_PATH", str(BASE_DIR / "prebunk.db")))

CONTENT_PATH = Path(os.getenv("PREBUNK_CONTENT_PATH", str(BASE_DIR / "content.json")))

# Comma-separated list of allowed origins, e.g. "https://prebunk.vercel.app,http://localhost:5173"
# Defaults to "*" for hackathon development; tighten before a real public launch.
_origins_env = os.getenv("PREBUNK_CORS_ORIGINS", "*")
CORS_ORIGINS = ["*"] if _origins_env.strip() == "*" else [
    o.strip() for o in _origins_env.split(",") if o.strip()
]

APP_NAME = "Prebunk API"
APP_VERSION = "1.0.0"
