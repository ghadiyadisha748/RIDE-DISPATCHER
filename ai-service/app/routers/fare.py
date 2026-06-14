"""
app/routers/fare.py
Fare prediction endpoint.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.schemas.requests import FarePredictRequest, FarePredictResponse
from app.utils.model_loader import get_loader

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fare", tags=["Fare Prediction"])


@router.post(
    "/predict",
    response_model=FarePredictResponse,
    summary="Predict ride fare",
    description=(
        "Returns an estimated fare in INR based on distance, ride type, time of day, "
        "and traffic conditions. Uses a Random Forest model trained on synthetic Indian "
        "ride-market data."
    ),
)
async def predict_fare(request: FarePredictRequest) -> FarePredictResponse:
    """Estimate the fare for a ride request."""
    try:
        predictor = get_loader().get_fare_predictor()
        result = predictor.predict(request.model_dump())
        return FarePredictResponse(**result)
    except Exception as exc:
        logger.exception("Fare prediction failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Fare prediction error: {exc}") from exc
