"""
app/models/driver_performance.py
Composite weighted scoring engine for driver performance evaluation.

No ML model is required – scoring is deterministic and explainable.
"""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

# Weights for the composite score (must sum to 1.0)
W_RATING: float       = 0.30
W_COMPLETION: float   = 0.25
W_RESPONSE: float     = 0.15
W_SENTIMENT: float    = 0.20
W_NO_CANCEL: float    = 0.10

# Grade thresholds
GRADE_THRESHOLDS = [
    (90, "A"),
    (75, "B"),
    (60, "C"),
    (45, "D"),
    (0,  "F"),
]


def _grade(score: float) -> str:
    for threshold, letter in GRADE_THRESHOLDS:
        if score >= threshold:
            return letter
    return "F"


class DriverPerformanceAnalyzer:
    """
    Pure-scoring engine that converts raw driver KPIs into a composite
    performance score, letter grade, strengths, and improvement areas.
    """

    def analyze(self, data: dict[str, Any]) -> dict[str, Any]:
        """
        Compute driver performance from input KPIs.

        Expected keys:
            driver_id, avg_rating, completion_rate, avg_response_time_sec,
            cancellation_rate, total_rides, positive_sentiment_pct
        """
        driver_id = str(data.get("driver_id", "unknown"))

        avg_rating: float = float(data.get("avg_rating", 3.0))
        completion_rate: float = float(data.get("completion_rate", 0.8))
        response_time_sec: float = float(data.get("avg_response_time_sec", 60.0))
        cancellation_rate: float = float(data.get("cancellation_rate", 0.1))
        total_rides: int = int(data.get("total_rides", 0))
        sentiment_pct: float = float(data.get("positive_sentiment_pct", 70.0))

        # -----------------------------------------------------------------
        # Individual component scores  (all normalised to 0-100)
        # -----------------------------------------------------------------

        # Rating: 1-5 stars → 0-100
        rating_score = ((avg_rating - 1.0) / 4.0) * 100.0

        # Completion rate: 0-1 → 0-100
        completion_score = completion_rate * 100.0

        # Response time: ideally < 30 s, max penalty at 5 min (300 s)
        response_score = max(0.0, 100.0 - (response_time_sec / 3.0))

        # Positive sentiment: already in 0-100
        sentiment_score = min(sentiment_pct, 100.0)

        # Cancellation penalty: 0 cancellations = 100, 0.5 cancellation rate = 0
        cancellation_score = max(0.0, 100.0 - (cancellation_rate * 200.0))

        # Experience bonus: tiny uplift for drivers with many rides
        experience_bonus = min(5.0, total_rides / 200.0)

        # -----------------------------------------------------------------
        # Composite weighted score
        # -----------------------------------------------------------------
        composite = (
            W_RATING     * rating_score
            + W_COMPLETION * completion_score
            + W_RESPONSE   * response_score
            + W_SENTIMENT  * sentiment_score
            + W_NO_CANCEL  * cancellation_score
            + experience_bonus
        )
        performance_score = round(min(100.0, composite), 2)
        grade = _grade(performance_score)

        # -----------------------------------------------------------------
        # Strengths and improvement areas
        # -----------------------------------------------------------------
        strengths: list[str] = []
        improvements: list[str] = []

        if rating_score >= 80:
            strengths.append("Excellent passenger ratings (≥4.2 stars)")
        elif rating_score < 50:
            improvements.append("Improve passenger ratings — aim for ≥4.0 stars")

        if completion_score >= 90:
            strengths.append("Very high ride completion rate (≥90%)")
        elif completion_score < 70:
            improvements.append("Increase ride completion rate — target ≥80%")

        if response_score >= 70:
            strengths.append("Fast response to ride requests")
        elif response_score < 40:
            improvements.append("Reduce average response time — aim for <60 seconds")

        if sentiment_score >= 75:
            strengths.append("Strong positive passenger feedback")
        elif sentiment_score < 50:
            improvements.append("Work on passenger experience to earn more positive reviews")

        if cancellation_score >= 80:
            strengths.append("Low cancellation rate — reliable driver")
        elif cancellation_score < 50:
            improvements.append("Reduce cancellations — high cancellation hurts reliability score")

        if total_rides >= 500:
            strengths.append(f"Experienced driver ({total_rides} rides completed)")
        elif total_rides < 50:
            improvements.append("Build experience — complete more rides to improve ranking")

        # Ensure at least one entry in each list
        if not strengths:
            strengths.append("Consistent performance across all metrics")
        if not improvements:
            improvements.append("Maintain current excellent performance")

        logger.debug(
            "DriverPerformanceAnalyzer: driver=%s score=%.2f grade=%s",
            driver_id,
            performance_score,
            grade,
        )

        return {
            "performance_score": performance_score,
            "grade": grade,
            "strengths": strengths,
            "improvements": improvements,
        }
