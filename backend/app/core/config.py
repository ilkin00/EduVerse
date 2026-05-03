from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Uygulama
    PROJECT_NAME: str = "EduVerse"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Veritabanı
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: str = "5432"
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Redis
    REDIS_HOST: str
    REDIS_PORT: int
    
    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenRouter AI
    OPENROUTER_API_KEY: str
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    
    # === LİVEKİT EKLENDİ ===
    LIVEKIT_API_KEY: str = "apikey"
    LIVEKIT_API_SECRET: str = "zlTrRT0HnDglglj+yrhKJZNWr+wYoL47hWmDQTuQl1M="
    LIVEKIT_URL: str = "ws://livekit:7880"  # Docker internal
    LIVEKIT_WS_URL: str = "wss://livekit.eduvers.site"  # External URL
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
