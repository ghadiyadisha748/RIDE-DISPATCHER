"""
app/config.py
Configuration management for RIDE-DISPATCHER AI Service.
Loads settings from environment variables or a .env file.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if present (useful for local development)
load_dotenv()

# Base directory of the project (one level above app/)
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings:
    """Application settings loaded from environment variables."""

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")

    # Model storage
    MODEL_DIR: str = os.getenv(
        "MODEL_DIR", str(BASE_DIR / "trained_models")
    )

    # Database (optional – not used by the AI service itself but exposed for downstream)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:password@localhost:5432/ridedispatcher"
    )

    # CORS origins (comma-separated list; "*" = allow all)
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")

    # Feature flags
    AUTO_TRAIN_ON_STARTUP: bool = (
        os.getenv("AUTO_TRAIN_ON_STARTUP", "true").lower() == "true"
    )

    def model_path(self, filename: str) -> str:
        """Return the absolute path for a model file."""
        return str(Path(self.MODEL_DIR) / filename)


# Singleton instance used throughout the app
settings = Settings()
