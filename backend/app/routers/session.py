import uuid

from fastapi import APIRouter

from app.content import library
from app.database import get_db
from app.schemas import SessionResponse

router = APIRouter(tags=["session"])


@router.post("/session", response_model=SessionResponse, status_code=201)
def create_session():
    """Start a new play session. Call this once when the app loads."""
    session_id = str(uuid.uuid4())
    with get_db() as conn:
        conn.execute(
            "INSERT INTO sessions (session_id, last_post_id) VALUES (?, NULL)",
            (session_id,),
        )
        conn.executemany(
            "INSERT INTO category_stats (session_id, category_id, correct, wrong) VALUES (?, ?, 0, 0)",
            [(session_id, cat) for cat in library.category_ids],
        )
    return SessionResponse(session_id=session_id)
