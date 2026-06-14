"""
app/main.py
RIDE-DISPATCHER AI Service – FastAPI application entry point.

Registers all routers, adds CORS middleware, provides a health-check endpoint,
and ensures all ML models are loaded (or trained) at startup.
"""

from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import demand, dispatch, fare, fraud, sentiment
from app.utils.model_loader import get_loader

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Startup / shutdown lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Load or train all models before accepting requests."""
    logger.info("=" * 60)
    logger.info("RIDE-DISPATCHER AI Service starting up …")
    logger.info("Model directory: %s", settings.MODEL_DIR)

    # Ensure the model directory exists
    Path(settings.MODEL_DIR).mkdir(parents=True, exist_ok=True)

    loader = get_loader()
    model_dir = Path(settings.MODEL_DIR)

    if settings.AUTO_TRAIN_ON_STARTUP:
        # Check each model file individually – only train what's missing
        model_files = {
            "fare_model.joblib":      lambda: loader.get_fare_predictor().train(),
            "demand_model.joblib":    lambda: loader.get_demand_forecaster().train(),
            "sentiment_model.joblib": lambda: loader.get_sentiment_analyzer().train(),
            "fraud_model.joblib":     lambda: loader.get_fraud_detector().train(),
        }
        for filename, train_fn in model_files.items():
            if not (model_dir / filename).exists():
                logger.info("Model not found – training: %s", filename)
                t0 = time.time()
                train_fn()
                logger.info("Trained %s in %.1f s", filename, time.time() - t0)
            else:
                logger.info("Model already exists: %s", filename)

    # Warm up (load all models into memory)
    loader.warm_up()

    logger.info("All models ready. API accepting requests.")
    logger.info("=" * 60)

    yield  # Application runs here

    logger.info("RIDE-DISPATCHER AI Service shutting down …")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="RIDE-DISPATCHER AI Service",
    description=(
        "Machine learning microservice for the RIDE-DISPATCHER platform.\n\n"
        "Provides:\n"
        "- **Fare Prediction** – Random Forest model for INR fare estimates\n"
        "- **Smart Dispatch** – KD-Tree distance + composite driver ranking\n"
        "- **Demand Forecasting** – XGBoost demand predictor with Indian city patterns\n"
        "- **Sentiment Analysis** – TF-IDF + Logistic Regression on ride reviews\n"
        "- **Fraud Detection** – Isolation Forest anomaly detector\n"
        "- **Driver Performance** – Weighted composite KPI scorer\n"
    ),
    version="1.0.0",
    contact={
        "name": "RIDE-DISPATCHER Engineering",
        "email": "ai-service@ride-dispatcher.local",
    },
    license_info={"name": "MIT"},
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Dev: allow all; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(fare.router,      prefix="/ai")
app.include_router(dispatch.router,  prefix="/ai")
app.include_router(demand.router,    prefix="/ai")
app.include_router(sentiment.router, prefix="/ai")
app.include_router(fraud.router,     prefix="/ai")

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

_start_time = time.time()


@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    response_description="Service liveness and basic status",
)
async def health_check() -> JSONResponse:
    """
    Returns HTTP 200 when the service is healthy.
    Includes uptime, model directory, and environment.
    """
    model_dir = Path(settings.MODEL_DIR)
    model_files = list(model_dir.glob("*.joblib"))

    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "RIDE-DISPATCHER AI Service",
            "version": "1.0.0",
            "uptime_seconds": round(time.time() - _start_time, 1),
            "model_dir": str(model_dir),
            "loaded_models": [f.name for f in model_files],
            "environment": os.getenv("ENVIRONMENT", "development"),
        },
    )


@app.get("/", tags=["System"], include_in_schema=False)
async def root() -> JSONResponse:
    """Redirect hint for the API root."""
    return JSONResponse(
        {"message": "RIDE-DISPATCHER AI Service", "docs": "/docs", "health": "/health"}
    )
