import os
import secrets
from typing import Optional, List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Uygulama
    PROJECT_NAME: str = "EduVerse"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security - ZORUNLU ENV
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: str = "5432"
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Redis
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: Optional[str] = None
    
    @property
    def REDIS_URL(self) -> str:
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/0"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
    
    # LiveKit
    LIVEKIT_API_KEY: str
    LIVEKIT_API_SECRET: str
    LIVEKIT_URL: str
    LIVEKIT_WS_URL: str
    
    # AI
    OPENROUTER_API_KEY: str
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    
    # Performance
    RELOAD: bool = False
    WORKERS: int = 4
    MAX_REQUESTS: int = 1000
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "https://app.eduvers.site",
        "https://eduvers.site",
        "http://localhost:3000",
        "http://localhost:8081",
    ]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        
        # .env dosyasını root'ta ara
        @classmethod
        def customise_sources(cls, init_settings, env_settings, file_secret_settings):
            return (
                init_settings,
                env_settings,
                file_secret_settings,
            )

settings = Settings()

# Validation
if not settings.SECRET_KEY or settings.SECRET_KEY == "CHANGE_ME":
    raise ValueError("SECRET_KEY must be set in .env file!")
    
if not settings.LIVEKIT_API_SECRET or len(settings.LIVEKIT_API_SECRET) < 32:
    raise ValueError("LIVEKIT_API_SECRET must be at least 32 characters!")
