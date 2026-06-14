"""
app/routers/sentiment.py
Sentiment analysis endpoint.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.schemas.requests import SentimentRequest, SentimentResponse
from app.utils.model_loader import get_loader

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sentiment", tags=["Sentiment Analysis"])


@router.post(
    "/analyze",
    response_model=SentimentResponse,
    summary="Classify text sentiment",
    description=(
        "Classifies the sentiment of a ride review or any short text as "
        "positive, neutral, or negative. Uses a TF-IDF + Logistic Regression "
        "pipeline trained on Indian ride-hailing review samples."
    ),
)
async def analyze_sentiment(request: SentimentRequest) -> SentimentResponse:
    """Classify the sentiment of a review / feedback text."""
    try:
        analyzer = get_loader().get_sentiment_analyzer()
        result = analyzer.predict(request.text)
        return SentimentResponse(**result)
    except Exception as exc:
        logger.exception("Sentiment analysis failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Sentiment error: {exc}") from exc


@router.post(
    "/driver-review",
    response_model=SentimentResponse,
    summary="Analyze a driver review",
    description="Alias for /analyze – specifically intended for driver review feedback.",
)
async def analyze_driver_review(request: SentimentRequest) -> SentimentResponse:
    """Analyze sentiment of a driver review."""
    return await analyze_sentiment(request)
