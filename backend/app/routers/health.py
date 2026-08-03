from fastapi import APIRouter

from app.content import library
from app.database import get_db
from app.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health():
    """Liveness/readiness check — also useful to confirm content loaded correctly."""
    with get_db() as conn:
        session_count = conn.execute("SELECT COUNT(*) AS c FROM sessions").fetchone()["c"]
    return HealthResponse(status="ok", posts_loaded=len(library.posts), sessions_stored=session_count)
