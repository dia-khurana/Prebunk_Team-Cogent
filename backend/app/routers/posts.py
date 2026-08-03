from fastapi import APIRouter

from app.adaptive import pick_next_post
from app.content import library
from app.database import get_db
from app.deps import require_session
from app.schemas import CategoryOption, PostResponse

router = APIRouter(tags=["posts"])


@router.get("/post/{session_id}", response_model=PostResponse)
def get_post(session_id: str):
    """
    Return the next post to show the user, chosen adaptively based on
    their performance so far in this session. The correct category is
    intentionally never included in this response.
    """
    with get_db() as conn:
        require_session(conn, session_id)

        post = pick_next_post(conn, session_id)
        conn.execute(
            "UPDATE sessions SET last_post_id = ? WHERE session_id = ?",
            (post["id"], session_id),
        )

    return PostResponse(
        post_id=post["id"],
        category_options=[CategoryOption(**c) for c in library.category_options()],
        language=post["language"],
        difficulty=post["difficulty"],
        type=post["type"],
        text=post["text"],
    )
