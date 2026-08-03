"""Pydantic models — define the API's request/response contract explicitly."""

from typing import Literal, Optional

from pydantic import BaseModel, Field


class SessionResponse(BaseModel):
    session_id: str


class CategoryOption(BaseModel):
    id: str
    name: str


class PostResponse(BaseModel):
    post_id: str
    category_options: list[CategoryOption]
    language: str
    difficulty: str
    type: str
    text: str


class AnswerRequest(BaseModel):
    session_id: str
    post_id: str
    selected_category: str = Field(..., description="One of the 6 category ids")


class AnswerResponse(BaseModel):
    correct: bool
    correct_category: str
    explanation: str
    post_id: str


class CategoryBreakdown(BaseModel):
    category_id: str
    category_name: str
    correct: int
    wrong: int
    accuracy: Optional[float] = None


class ScoreResponse(BaseModel):
    session_id: str
    total_correct: int
    total_answered: int
    overall_accuracy: Optional[float] = None
    by_category: list[CategoryBreakdown]


class HealthResponse(BaseModel):
    status: Literal["ok"]
    posts_loaded: int
    sessions_stored: int


class ErrorResponse(BaseModel):
    detail: str
