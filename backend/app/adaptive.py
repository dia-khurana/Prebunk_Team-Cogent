"""
Adaptive post-selection logic.

Deliberately simple and explainable (weighted-random by wrong-rate), not a
black-box model — this is a design choice, not a limitation: judges and
users can both understand exactly why a given post was shown, which
matters for a media-literacy education tool that should model transparency,
not obscure it behind an unexplainable ranking system.
"""

import random
import sqlite3

from app.content import library

BASELINE_WEIGHT = 1.0
WRONG_RATE_MULTIPLIER = 3.0
DEFAULT_WRONG_RATE_FOR_UNSEEN = 0.5  # medium priority until we have data


def get_category_stats(conn: sqlite3.Connection, session_id: str) -> dict:
    rows = conn.execute(
        "SELECT category_id, correct, wrong FROM category_stats WHERE session_id = ?",
        (session_id,),
    ).fetchall()
    stats = {cat: {"correct": 0, "wrong": 0} for cat in library.category_ids}
    for row in rows:
        stats[row["category_id"]] = {"correct": row["correct"], "wrong": row["wrong"]}
    return stats


def get_seen_post_ids(conn: sqlite3.Connection, session_id: str) -> set:
    rows = conn.execute(
        "SELECT post_id FROM seen_posts WHERE session_id = ?", (session_id,)
    ).fetchall()
    return {row["post_id"] for row in rows}


def compute_category_weights(stats: dict) -> list[float]:
    """Pure function, easy to unit test independent of the database."""
    weights = []
    for cat in library.category_ids:
        correct = stats[cat]["correct"]
        wrong = stats[cat]["wrong"]
        total = correct + wrong
        wrong_rate = (wrong / total) if total > 0 else DEFAULT_WRONG_RATE_FOR_UNSEEN
        weights.append(BASELINE_WEIGHT + (wrong_rate * WRONG_RATE_MULTIPLIER))
    return weights


def pick_next_post(conn: sqlite3.Connection, session_id: str) -> dict:
    stats = get_category_stats(conn, session_id)
    seen_post_ids = get_seen_post_ids(conn, session_id)

    last_post_row = conn.execute(
        "SELECT last_post_id FROM sessions WHERE session_id = ?", (session_id,)
    ).fetchone()
    last_post_id = last_post_row["last_post_id"] if last_post_row else None

    weights = compute_category_weights(stats)
    chosen_category = random.choices(library.category_ids, weights=weights, k=1)[0]

    candidates = [
        p for p in library.posts_by_category[chosen_category] if p["id"] != last_post_id
    ] or library.posts_by_category[chosen_category]

    unseen = [p for p in candidates if p["id"] not in seen_post_ids]
    pool = unseen if unseen else candidates  # once everything's seen, allow repeats

    return random.choice(pool)
