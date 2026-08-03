from fastapi import APIRouter

from app.adaptive import get_category_stats
from app.content import library
from app.database import get_db
from app.deps import require_session
from app.schemas import CategoryBreakdown, ScoreResponse

router = APIRouter(tags=["score"])


@router.get("/score/{session_id}", response_model=ScoreResponse)
def get_score(session_id: str):
    """Return overall + per-category accuracy for a session."""
    with get_db() as conn:
        require_session(conn, session_id)
        stats = get_category_stats(conn, session_id)

    breakdown = []
    total_correct = 0
    total_answered = 0
    for cat_id, s in stats.items():
        answered = s["correct"] + s["wrong"]
        total_correct += s["correct"]
        total_answered += answered
        breakdown.append(CategoryBreakdown(
            category_id=cat_id,
            category_name=library.category_names[cat_id],
            correct=s["correct"],
            wrong=s["wrong"],
            accuracy=round(s["correct"] / answered, 2) if answered else None,
        ))

    return ScoreResponse(
        session_id=session_id,
        total_correct=total_correct,
        total_answered=total_answered,
        overall_accuracy=round(total_correct / total_answered, 2) if total_answered else None,
        by_category=breakdown,
    )
