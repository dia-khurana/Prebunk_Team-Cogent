from fastapi import APIRouter, HTTPException

from app.content import library
from app.database import get_db
from app.deps import require_session
from app.schemas import AnswerRequest, AnswerResponse

router = APIRouter(tags=["answers"])


@router.post("/answer", response_model=AnswerResponse)
def submit_answer(payload: AnswerRequest):
    """Submit the user's chosen technique for a given post, get the result."""
    post = library.posts_by_id.get(payload.post_id)
    if post is None:
        raise HTTPException(status_code=404, detail=f"Post '{payload.post_id}' not found")

    if payload.selected_category not in library.category_ids:
        raise HTTPException(
            status_code=422,
            detail=f"'{payload.selected_category}' is not a valid category id",
        )

    correct_category = post["category"]
    is_correct = payload.selected_category == correct_category

    with get_db() as conn:
        require_session(conn, payload.session_id)

        column = "correct" if is_correct else "wrong"
        conn.execute(
            f"UPDATE category_stats SET {column} = {column} + 1 "
            f"WHERE session_id = ? AND category_id = ?",
            (payload.session_id, correct_category),
        )
        conn.execute(
            "INSERT OR IGNORE INTO seen_posts (session_id, post_id) VALUES (?, ?)",
            (payload.session_id, payload.post_id),
        )
        conn.execute(
            """INSERT INTO answer_log
               (session_id, post_id, selected_category, correct_category, is_correct)
               VALUES (?, ?, ?, ?, ?)""",
            (payload.session_id, payload.post_id, payload.selected_category,
             correct_category, int(is_correct)),
        )

    return AnswerResponse(
        correct=is_correct,
        correct_category=correct_category,
        explanation=post["explanation"],
        post_id=post["id"],
    )
