"""
Central application configuration.

All values are read from environment variables (see .env.example). Nothing
secret is hard-coded here - defaults are safe-for-local-dev placeholders only.
"""
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App ---
    APP_ENV: str = "development"
    APP_NAME: str = "Thermal Comfort Shelter Backend"
    API_V1_PREFIX: str = "/api/v1"

    # --- Database ---
    DATABASE_URL: str = "sqlite:///./shelter.db"

    # --- JWT ---
    JWT_SECRET_KEY: str = "CHANGE_THIS_DEV_ONLY_SECRET"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- CORS / Frontend ---
    FRONTEND_URL: str = "http://localhost:3000"

    # --- OAuth: Google ---
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://127.0.0.1:8000/api/v1/auth/google/callback"

    # --- OAuth: GitHub ---
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://127.0.0.1:8000/api/v1/auth/github/callback"

    # --- NASA POWER ---
    NASA_POWER_URL: str = "https://power.larc.nasa.gov/api/temporal/climatology/point"
    NASA_POWER_TIMEOUT_SECONDS: float = 15.0

    # --- ML Artifacts ---
    ARTIFACTS_DIR: str = str(BASE_DIR / "artifacts")

    # --- Weather cache ---
    WEATHER_CACHE_TTL_SECONDS: int = 60 * 60 * 24  # 24h, climatology data barely changes

    @property
    def cors_origins(self) -> List[str]:
        return [self.FRONTEND_URL]


@lru_cache
def get_settings() -> Settings:
    return Settings()
