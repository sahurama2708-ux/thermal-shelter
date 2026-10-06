from fastapi import APIRouter
from sqlalchemy import text

from app.database import SessionLocal
from app.services.model import model_service

router = APIRouter(tags=["health"])


def _check_database() -> str:
    try:
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            return "ok"
        finally:
            db.close()
    except Exception:
        return "error"


@router.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model_service.is_loaded,
        "database": _check_database(),
    }


@router.get("/api/v1/health")
def health_v1():
    return health()
