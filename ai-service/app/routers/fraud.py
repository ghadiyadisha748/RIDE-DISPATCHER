"""
app/routers/fraud.py
Fraud detection endpoints.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.schemas.requests import (
    DriverPerformanceRequest,
    DriverPerformanceResponse,
    FraudCheckRequest,
    FraudCheckResponse,
)
from app.utils.model_loader import get_loader

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fraud", tags=["Fraud & Performance"])


@router.post(
    "/check",
    response_model=FraudCheckResponse,
    summary="Check user for fraudulent behaviour",
    description=(
        "Runs an Isolation Forest anomaly detector against the user's behavioural "
        "profile (cancellation rate, booking frequency, payment failures, etc.) and "
        "returns a fraud score, risk level, and specific flags."
    ),
)
async def check_fraud(request: FraudCheckRequest) -> FraudCheckResponse:
    """Assess a user's profile for fraud / anomalous behaviour."""
    try:
        detector = get_loader().get_fraud_detector()
        result = detector.predict(request.model_dump())
        return FraudCheckResponse(**result)
    except Exception as exc:
        logger.exception("Fraud check failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Fraud check error: {exc}") from exc


@router.post(
    "/driver-performance",
    response_model=DriverPerformanceResponse,
    summary="Evaluate driver performance",
    description=(
        "Computes a composite driver performance score from KPIs including rating, "
        "completion rate, response time, cancellation rate, and positive sentiment %. "
        "Returns a grade (A-F) with strengths and improvement suggestions."
    ),
)
async def evaluate_driver(request: DriverPerformanceRequest) -> DriverPerformanceResponse:
    """Analyse and grade a driver's performance KPIs."""
    try:
        analyzer = get_loader().get_driver_analyzer()
        result = analyzer.analyze(request.model_dump())
        return DriverPerformanceResponse(**result)
    except Exception as exc:
        logger.exception("Driver performance evaluation failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Performance evaluation error: {exc}") from exc
