"""
app/schemas/requests.py
Pydantic request and response models for all RIDE-DISPATCHER AI endpoints.
"""

from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Fare Prediction
# ---------------------------------------------------------------------------

class FarePredictRequest(BaseModel):
    """Input payload for fare estimation."""

    distance_km: float = Field(..., gt=0, le=500, description="Trip distance in kilometres")
    ride_type: str = Field(..., description="Vehicle category: auto | bike | cab | premium")
    hour_of_day: int = Field(..., ge=0, le=23, description="Hour of pickup (0-23, 24h clock)")
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week (0=Monday … 6=Sunday)")
    pickup_area: str = Field(..., description="Name or identifier of the pickup area")
    traffic_factor: float = Field(1.0, ge=1.0, le=3.0, description="1.0=normal, 1.5=heavy, 2.0=severe")

    @field_validator("ride_type")
    @classmethod
    def validate_ride_type(cls, v: str) -> str:
        allowed = {"auto", "bike", "cab", "premium"}
        if v.lower() not in allowed:
            raise ValueError(f"ride_type must be one of {allowed}")
        return v.lower()


class FarePredictResponse(BaseModel):
    """Fare estimate with surge details."""

    estimated_fare: float = Field(..., description="Final estimated fare in INR")
    surge_multiplier: float = Field(..., description="Applied surge multiplier (1.0 = no surge)")
    breakdown: dict[str, Any] = Field(..., description="Per-component fare breakdown")
    model_used: str = Field(..., description="ML model identifier")


# ---------------------------------------------------------------------------
# Smart Dispatch
# ---------------------------------------------------------------------------

class DriverInfo(BaseModel):
    """Single driver data passed with a dispatch request."""

    id: str
    lat: float
    lng: float
    rating: float = Field(..., ge=1.0, le=5.0)
    completion_rate: float = Field(..., ge=0.0, le=1.0)


class RankedDriver(BaseModel):
    """A driver entry in the dispatch response."""

    driver_id: str
    score: float
    distance_km: float
    eta_min: float


class DispatchRequest(BaseModel):
    """Input payload for driver dispatch ranking."""

    pickup_lat: float = Field(..., ge=-90, le=90)
    pickup_lng: float = Field(..., ge=-180, le=180)
    ride_type: str = Field(..., description="auto | bike | cab | premium")
    available_drivers: list[DriverInfo] = Field(..., min_length=1)

    @field_validator("ride_type")
    @classmethod
    def validate_ride_type(cls, v: str) -> str:
        allowed = {"auto", "bike", "cab", "premium"}
        if v.lower() not in allowed:
            raise ValueError(f"ride_type must be one of {allowed}")
        return v.lower()


class DispatchResponse(BaseModel):
    """Ranked list of drivers best suited for this ride."""

    ranked_drivers: list[RankedDriver]


# ---------------------------------------------------------------------------
# Demand Forecasting
# ---------------------------------------------------------------------------

class DemandRequest(BaseModel):
    """Input payload for ride demand prediction."""

    area_name: str = Field(..., description="Name of the area / locality")
    city: str = Field("Surat", description="City name")
    hour_of_day: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    is_weekend: bool = Field(False)


class DemandResponse(BaseModel):
    """Demand forecast result."""

    predicted_demand: int = Field(..., description="Predicted number of ride requests")
    demand_level: str = Field(..., description="low | moderate | high | very_high")
    surge_multiplier: float
    peak_hours: list[int] = Field(..., description="Hours of the day that are peak for this area")


# ---------------------------------------------------------------------------
# Sentiment Analysis
# ---------------------------------------------------------------------------

class SentimentRequest(BaseModel):
    """Input text for sentiment classification."""

    text: str = Field(..., min_length=1, max_length=2000)


class SentimentResponse(BaseModel):
    """Sentiment analysis result."""

    sentiment: str = Field(..., description="positive | neutral | negative")
    confidence: float = Field(..., ge=0.0, le=1.0)
    scores: dict[str, float] = Field(..., description="Probability for each class")


# ---------------------------------------------------------------------------
# Fraud Detection
# ---------------------------------------------------------------------------

class FraudCheckRequest(BaseModel):
    """Behavioural features for fraud / anomaly detection."""

    user_id: str
    cancellation_rate: float = Field(..., ge=0.0, le=1.0, description="Fraction of rides cancelled")
    booking_frequency: float = Field(..., ge=0.0, description="Average rides booked per day")
    avg_distance: float = Field(..., ge=0.0, description="Average ride distance in km")
    payment_failures: int = Field(..., ge=0, description="Number of failed payment attempts")
    account_age_days: int = Field(..., ge=0, description="Days since account creation")


class FraudCheckResponse(BaseModel):
    """Fraud assessment result."""

    is_fraud: bool
    fraud_score: float = Field(..., ge=0.0, le=1.0, description="0=clean, 1=definitely fraud")
    risk_level: str = Field(..., description="low | medium | high | critical")
    flags: list[str] = Field(..., description="Human-readable reasons for the risk score")


# ---------------------------------------------------------------------------
# Driver Performance
# ---------------------------------------------------------------------------

class DriverPerformanceRequest(BaseModel):
    """Driver metrics for performance analysis."""

    driver_id: str
    avg_rating: float = Field(..., ge=1.0, le=5.0)
    completion_rate: float = Field(..., ge=0.0, le=1.0)
    avg_response_time_sec: float = Field(..., ge=0.0)
    cancellation_rate: float = Field(..., ge=0.0, le=1.0)
    total_rides: int = Field(..., ge=0)
    positive_sentiment_pct: float = Field(..., ge=0.0, le=100.0)


class DriverPerformanceResponse(BaseModel):
    """Composite driver performance evaluation."""

    performance_score: float = Field(..., ge=0.0, le=100.0)
    grade: str = Field(..., description="A | B | C | D | F")
    strengths: list[str]
    improvements: list[str]
