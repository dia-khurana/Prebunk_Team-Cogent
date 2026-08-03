"""
SQLite connection handling and schema management.

Why SQLite for this project: no separate database server to provision,
built into Python's standard library, and the data model (a handful of
small per-session tables) doesn't need anything heavier. It is a
genuinely production-viable choice for an app at this scale — not just
a hackathon shortcut. If usage ever outgrows a single SQLite file, the
migration path is to point DATABASE logic at Postgres; the SQL here is
intentionally plain (no SQLite-specific syntax beyond IF NOT EXISTS)
to keep that migration straightforward.
"""

import sqlite3
from contextlib import contextmanager

from app.config import DB_PATH


@contextmanager
def get_db():
    """Yield a SQLite connection, committing on success and always closing."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(categories: list[str]) -> None:
    """Create tables if they don't exist yet. Safe to call on every startup."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                last_post_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS category_stats (
                session_id TEXT NOT NULL,
                category_id TEXT NOT NULL,
                correct INTEGER NOT NULL DEFAULT 0,
                wrong INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (session_id, category_id),
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS seen_posts (
                session_id TEXT NOT NULL,
                post_id TEXT NOT NULL,
                seen_at TEXT DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (session_id, post_id),
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS answer_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                post_id TEXT NOT NULL,
                selected_category TEXT NOT NULL,
                correct_category TEXT NOT NULL,
                is_correct INTEGER NOT NULL,
                answered_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Helpful indexes for the queries we actually run
        conn.execute("CREATE INDEX IF NOT EXISTS idx_category_stats_session ON category_stats(session_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_seen_posts_session ON seen_posts(session_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_answer_log_session ON answer_log(session_id)")
