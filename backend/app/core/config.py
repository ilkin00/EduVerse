from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Uygulama
    PROJECT_NAME: str = "EduVerse"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Veritabanı
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "eduverse_user"
    POSTGRES_PASSWORD: str = "EduVerse2026!"
    POSTGRES_DB: str = "eduverse_db"
    POSTGRES_PORT: str = "5432"
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}"
    
    # JWT
    SECRET_KEY: str = "eduverse-gizli-anahtar-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenRouter AI
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
