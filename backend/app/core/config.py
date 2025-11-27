
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings with environment-specific configurations."""
 
    model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            case_sensitive=True,
            extra="ignore"
        )

  # Database - PostgreSQL
    DATABASE_URL: str = "postgresql+psycopg://agentx:agentxxx@localhost:5432/agentx"
    
@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()

settings = get_settings()
