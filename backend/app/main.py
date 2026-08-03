"""
Prebunk API — entry point.

Run locally:
    uvicorn app.main:app --reload --port 8000

Interactive docs once running:
    http://127.0.0.1:8000/docs
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import APP_NAME, APP_VERSION, CORS_ORIGINS
from app.content import library
from app.database import init_db
from app.routers import answers, health, posts, score, session

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("prebunk")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db(library.category_ids)
    logger.info(f"{APP_NAME} v{APP_VERSION} started — {len(library.posts)} posts loaded")
    yield
    logger.info(f"{APP_NAME} shutting down")


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=(
        "Backend for Prebunk — an adaptive media-literacy game that teaches users to "
        "recognize manipulation techniques (false urgency, fake authority, emotional bait, "
        "fake consensus, misleading statistics, AI-generated content cues) in synthetic, "
        "realistic social-media-style messages."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error on {request.method} {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error — this has been logged."},
    )


app.include_router(session.router)
app.include_router(posts.router)
app.include_router(answers.router)
app.include_router(score.router)
app.include_router(health.router)


@app.get("/", tags=["health"])
def root():
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }
