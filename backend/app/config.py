from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://fit:fit@localhost:5432/fit"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7일

    # Admin 초기 시딩
    ADMIN_PASSWORD: str = ""

    # Notion (마이그레이션용)
    NOTION_TOKEN: str = ""
    NOTION_WORKOUT_DB_ID: str = ""
    NOTION_EXERCISE_LOG_DB_ID: str = ""

    model_config = {"env_file": "../.env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
