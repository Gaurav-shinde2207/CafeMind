import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database

# Import routers
from app.routes.health import router as health_router
from app.routes.menu import router as menu_router
from app.routes.orders import router as orders_router
from app.routes.gemini import router as gemini_router
from app.routes.feedback import router as feedback_router
from app.routes.stats import router as stats_router
from app.routes.preferences import router as preferences_router

# Create database tables and seed
Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    try:
        seed_database(db)
    except Exception as e:
        print(f"[Startup] Warning during initial seed: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CafeMind - Intelligent AI-Powered Café Ecosystem",
    version=settings.VERSION
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(health_router, prefix="/api")
app.include_router(menu_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(gemini_router, prefix="/api")
app.include_router(feedback_router, prefix="/api")
app.include_router(stats_router, prefix="/api")
app.include_router(preferences_router, prefix="/api")

# Static frontend serving — resolve dist dir across local repo AND container layouts
_CANDIDATE_BASES = [
    Path(__file__).resolve().parent.parent.parent,  # repo layout:   SmartCafe/backend/app -> SmartCafe
    Path(__file__).resolve().parent.parent,         # container:     /app/app -> /app
    Path.cwd(),                                     # fallback: cwd/frontend/dist
]
DIST_DIR = next(
    (base / "frontend" / "dist" for base in _CANDIDATE_BASES if (base / "frontend" / "dist").is_dir()),
    _CANDIDATE_BASES[0] / "frontend" / "dist",
)

if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept /api routes
        if full_path.startswith("api"):
            return HTMLResponse(status_code=404, content="API route not found")
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")
else:
    @app.get("/")
    def index():
        return {
            "message": "Welcome to CafeMind API",
            "docs": "/docs",
            "health": "/api/health",
            "tagline": settings.TAGLINE
        }
