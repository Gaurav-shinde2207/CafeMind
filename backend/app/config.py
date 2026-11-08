import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current dir, parent dir, or backend dir
env_paths = [
    Path(__file__).resolve().parent.parent / ".env",
    Path.cwd() / ".env",
    Path.cwd() / "backend" / ".env"
]

for p in env_paths:
    if p.exists():
        load_dotenv(dotenv_path=p)
        break

class Settings:
    PROJECT_NAME: str = "CafeMind"
    VERSION: str = "1.0.0"
    TAGLINE: str = "Your café. Your preferences. Your experience."
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8080"))

    # Cloud SQL Configuration
    CLOUD_SQL_CONNECTION_NAME: str = os.getenv("CLOUD_SQL_CONNECTION_NAME", "").strip()
    DB_USER: str = os.getenv("DB_USER", "cafemind_user").strip()
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "").strip()
    DB_NAME: str = os.getenv("DB_NAME", "cafemind").strip()

    # Database URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "").strip()
    
    # Auto-construct Cloud SQL Unix Socket URL if CLOUD_SQL_CONNECTION_NAME is present
    if CLOUD_SQL_CONNECTION_NAME:
        DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@/{DB_NAME}?host=/cloudsql/{CLOUD_SQL_CONNECTION_NAME}"
    elif not DATABASE_URL:
        DATABASE_URL = "sqlite:///./cafemind.db"
    
    # Fix standard postgres:// URI for SQLAlchemy if needed
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

    # Production safety check: Do not allow silent SQLite in production
    if ENVIRONMENT == "production" and DATABASE_URL.startswith("sqlite"):
        # Explicit warning that production requires Cloud SQL
        print("[CRITICAL WARNING] Running in production mode but DATABASE_URL is SQLite. Cloud SQL PostgreSQL instance connection is required for production.")

    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

    # Staff Dashboard Access Protection
    STAFF_PIN: str = os.getenv("STAFF_PIN", "1234")

settings = Settings()
