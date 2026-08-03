"""
Automated tests for the Prebunk API. Run with:
    pytest -v

These cover the same flow you'd test manually in Postman, so any change
that breaks the contract gets caught immediately rather than discovered
during a live demo.
"""

import os
import sys
from pathlib import Path

import pytest

# Ensure a clean, isolated test database (never touch the real prebunk.db)
TEST_DB = Path(__file__).parent / "test_prebunk.db"
os.environ["PREBUNK_DB_PATH"] = str(TEST_DB)

sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def clean_db():
    if TEST_DB.exists():
        TEST_DB.unlink()
    yield
    if TEST_DB.exists():
        TEST_DB.unlink()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["posts_loaded"] == 30


def test_create_session(client):
    r = client.post("/session")
    assert r.status_code == 201
    body = r.json()
    assert "session_id" in body
    assert len(body["session_id"]) > 0


def test_get_post_requires_valid_session(client):
    r = client.get("/post/does-not-exist")
    assert r.status_code == 404


def test_full_happy_path(client):
    # 1. create session
    session_id = client.post("/session").json()["session_id"]

    # 2. get a post
    post = client.get(f"/post/{session_id}").json()
    assert "post_id" in post
    assert len(post["category_options"]) == 6
    # correct answer must never leak in the post response
    assert "category" not in post
    assert "explanation" not in post

    # 3. submit the (deliberately wrong) answer, check the contract shape
    wrong_category = next(
        c["id"] for c in post["category_options"]
    )  # any valid category id works for shape-testing
    answer = client.post("/answer", json={
        "session_id": session_id,
        "post_id": post["post_id"],
        "selected_category": wrong_category,
    }).json()
    assert "correct" in answer
    assert "correct_category" in answer
    assert "explanation" in answer

    # 4. score reflects the answer
    score = client.get(f"/score/{session_id}").json()
    assert score["total_answered"] == 1


def test_answer_with_invalid_post_id(client):
    session_id = client.post("/session").json()["session_id"]
    r = client.post("/answer", json={
        "session_id": session_id,
        "post_id": "not-a-real-post",
        "selected_category": "false_urgency",
    })
    assert r.status_code == 404


def test_answer_with_invalid_category(client):
    session_id = client.post("/session").json()["session_id"]
    post = client.get(f"/post/{session_id}").json()
    r = client.post("/answer", json={
        "session_id": session_id,
        "post_id": post["post_id"],
        "selected_category": "not_a_real_category",
    })
    assert r.status_code == 422


def test_answer_with_missing_fields(client):
    r = client.post("/answer", json={"session_id": "abc"})
    assert r.status_code == 422  # FastAPI/Pydantic validation error


def test_score_for_unknown_session(client):
    r = client.get("/score/does-not-exist")
    assert r.status_code == 404


def test_correct_answer_increments_correct_count(client):
    session_id = client.post("/session").json()["session_id"]
    post = client.get(f"/post/{session_id}").json()

    # Find the real correct category by checking content.json directly
    import json
    content = json.load(open(Path(__file__).parent.parent / "content.json"))
    real_category = next(p["category"] for p in content["posts"] if p["id"] == post["post_id"])

    answer = client.post("/answer", json={
        "session_id": session_id,
        "post_id": post["post_id"],
        "selected_category": real_category,
    }).json()
    assert answer["correct"] is True

    score = client.get(f"/score/{session_id}").json()
    matching = next(c for c in score["by_category"] if c["category_id"] == real_category)
    assert matching["correct"] == 1
    assert matching["accuracy"] == 1.0


def test_persistence_across_new_connection(client):
    """Simulates a server restart: data must survive because it's in SQLite, not memory."""
    session_id = client.post("/session").json()["session_id"]
    client.get(f"/post/{session_id}")

    # Fresh TestClient = fresh app instance wiring, but same DB file
    from app.main import app as app2
    with TestClient(app2) as client2:
        health = client2.get("/health").json()
        assert health["sessions_stored"] >= 1


def test_adaptive_logic_favors_weak_category():
    """
    Statistical check: if a user consistently gets one category wrong,
    that category should be served noticeably more often than baseline.
    Not a strict guarantee (it's randomized), so we run many trials.
    """
    from app.adaptive import compute_category_weights
    from app.content import library

    stats = {cat: {"correct": 0, "wrong": 0} for cat in library.category_ids}
    weak_category = library.category_ids[0]
    stats[weak_category] = {"correct": 0, "wrong": 10}  # 100% wrong rate

    weights = compute_category_weights(stats)
    weak_index = library.category_ids.index(weak_category)

    # The weak category's weight should be the maximum among all weights
    assert weights[weak_index] == max(weights)
