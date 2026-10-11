from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# === SYNC (mevcut endpoint'ler için) ===
# asyncpg URL'ini psycopg2 URL'ine çevir
SYNC_DATABASE_URL = settings.DATABASE_URL.replace("+asyncpg", "")

engine = create_engine(
    SYNC_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Sync DB session dependency - mevcut endpoint'ler için"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# === ASYNC (main.py lifespan + websocket için) ===
async_engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)
