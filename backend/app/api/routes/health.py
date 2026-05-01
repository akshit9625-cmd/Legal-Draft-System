"""Health check endpoint."""

from fastapi import APIRouter, Request
from app.db.redis_client import get_redis

router = APIRouter()


@router.get("/health")
async def health_check(request: Request):
    """Returns system health status."""
    redis_ok = False
    try:
        r = get_redis()
        await r.ping()
        redis_ok = True
    except Exception:
        pass

    nlp_loaded = hasattr(request.app.state, "nlp_pipeline") and request.app.state.nlp_pipeline._loaded

    return {
        "status": "ok",
        "redis": "connected" if redis_ok else "disconnected",
        "nlp_pipeline": "loaded" if nlp_loaded else "not_loaded",
    }
