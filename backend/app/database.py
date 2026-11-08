import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Engine configuration
connect_args = {}
engine_kwargs = {"pool_pre_ping": True}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Production PostgreSQL connection pooling
    engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 1800
    })

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_database_health():
    """Verify database connection and identify engine type honestly."""
    start_time = time.time()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        latency_ms = round((time.time() - start_time) * 1000, 2)
        
        is_postgres = settings.DATABASE_URL.startswith("postgresql")
        is_cloud_sql = is_postgres and (
            bool(settings.CLOUD_SQL_CONNECTION_NAME) or 
            any(kw in settings.DATABASE_URL.lower() for kw in ["cloudsql", "google", "gcp", "34.", "35."])
        )

        if is_cloud_sql:
            db_type = "Google Cloud SQL PostgreSQL"
            status = "connected"
        elif is_postgres:
            db_type = "PostgreSQL"
            status = "connected"
        elif settings.ENVIRONMENT == "production":
            db_type = "SQLite (Local Fallback - Cloud SQL Required in Production)"
            status = "degraded"
        else:
            db_type = "SQLite (Local Fallback)"
            status = "connected"

        return {
            "status": status,
            "engine": "PostgreSQL" if is_postgres else "SQLite",
            "is_cloud_sql": is_cloud_sql,
            "database_type": db_type,
            "latency_ms": latency_ms,
            "error": None
        }
    except Exception as e:
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "error",
            "engine": "PostgreSQL" if settings.DATABASE_URL.startswith("postgresql") else "SQLite",
            "is_cloud_sql": False,
            "database_type": "Disconnected",
            "latency_ms": latency_ms,
            "error": str(e)
        }
