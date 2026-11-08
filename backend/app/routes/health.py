from fastapi import APIRouter
from app.database import check_database_health
from app.config import settings

router = APIRouter(prefix="/health", tags=["Health & Status"])

@router.get("")
def get_health_status():
    db_health = check_database_health()
    return {
        "status": "healthy" if db_health["status"] == "connected" else "degraded",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_health,
        "gemini": {
            "configured": bool(settings.GEMINI_API_KEY),
            "model": settings.GEMINI_MODEL,
            "mode": "Live Google Gemini API" if settings.GEMINI_API_KEY else "Intelligent Mock Engine (Test Mode)"
        }
    }
