"""Shared FastAPI dependencies / helpers used across multiple routers."""

import sqlite3

from fastapi import HTTPException


def require_session(conn: sqlite3.Connection, session_id: str) -> None:
    row = conn.execute(
        "SELECT 1 FROM sessions WHERE session_id = ?", (session_id,)
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
