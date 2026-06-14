"""
app/models/fare_predictor.py
Random Forest fare predictor for Indian urban ride-hailing market.

Training data is synthetically generated on first run and the model
is persisted via joblib so subsequent calls skip re-training.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

from app.utils.preprocessing import (
    encode_ride_type,
    get_surge_multiplier,
    is_peak_hour,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Rate card (INR)  base_fare + per_km_rate
# ---------------------------------------------------------------------------
RATE_CARD: dict[str, tuple[float, float]] = {
    "auto":    (25.0,  8.0),
    "bike":    (15.0,  5.0),
    "cab":     (40.0, 12.0),
    "premium": (80.0, 20.0),
}


class FarePredictor:
    """Random Forest model for predicting ride fares."""

    MODEL_FILENAME = "fare_model.joblib"
    FEATURES = [
        "distance_km",
        "ride_type_encoded",
        "hour_of_day",
        "day_of_week",
        "traffic_factor",
        "is_peak_hour",
    ]

    def __init__(self, model_dir: str = "trained_models") -> None:
        self.model_dir = Path(model_dir)
        self.model_path = self.model_dir / self.MODEL_FILENAME
        self._model: RandomForestRegressor | None = None

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def _generate_training_data(self, n_samples: int = 5000) -> pd.DataFrame:
        """Synthesise a labelled dataset mimicking Indian ride-hailing fares."""
        rng = np.random.default_rng(42)
        ride_types = ["auto", "bike", "cab", "premium"]

        distances = rng.uniform(1, 50, n_samples)
        rt_labels = rng.choice(ride_types, n_samples)
        hours = rng.integers(0, 24, n_samples)
        days = rng.integers(0, 7, n_samples)
        traffic = rng.uniform(1.0, 2.0, n_samples)

        fares = np.zeros(n_samples)
        for i in range(n_samples):
            base, per_km = RATE_CARD[rt_labels[i]]
            raw_fare = base + per_km * distances[i]

            # Time-of-day surge
            surge = get_surge_multiplier(int(hours[i]), int(days[i]))
            raw_fare *= surge

            # Traffic factor
            raw_fare *= traffic[i]

            # Random noise ±10 %
            noise = rng.uniform(0.90, 1.10)
            fares[i] = round(raw_fare * noise, 2)

        df = pd.DataFrame(
            {
                "distance_km": distances,
                "ride_type": rt_labels,
                "ride_type_encoded": [encode_ride_type(r) for r in rt_labels],
                "hour_of_day": hours.astype(int),
                "day_of_week": days.astype(int),
                "traffic_factor": traffic,
                "is_peak_hour": [int(is_peak_hour(int(h))) for h in hours],
                "fare": fares,
            }
        )
        return df

    def train(self) -> None:
        """Generate synthetic data, train a RandomForestRegressor, and save the model."""
        logger.info("FarePredictor: generating training data …")
        df = self._generate_training_data(5000)

        X = df[self.FEATURES].values
        y = df["fare"].values

        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            random_state=42,
            n_jobs=-1,
        )
        model.fit(X, y)

        self.model_dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(model, self.model_path)
        self._model = model
        logger.info("FarePredictor: model trained and saved → %s", self.model_path)

    def _load_model(self) -> RandomForestRegressor:
        if self._model is None:
            if not self.model_path.exists():
                logger.info("FarePredictor: no saved model found – training now …")
                self.train()
            else:
                self._model = joblib.load(self.model_path)
                logger.info("FarePredictor: loaded model from %s", self.model_path)
        return self._model  # type: ignore[return-value]

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def predict(self, data: dict[str, Any]) -> dict[str, Any]:
        """
        Predict fare for a single ride request.

        Expected keys in *data*:
            distance_km, ride_type, hour_of_day, day_of_week,
            pickup_area, traffic_factor
        """
        model = self._load_model()

        distance_km: float = float(data["distance_km"])
        ride_type: str = str(data["ride_type"]).lower()
        hour: int = int(data["hour_of_day"])
        day: int = int(data["day_of_week"])
        traffic: float = float(data.get("traffic_factor", 1.0))

        ride_encoded = encode_ride_type(ride_type)
        peak = int(is_peak_hour(hour))
        surge = get_surge_multiplier(hour, day)

        features = np.array([[distance_km, ride_encoded, hour, day, traffic, peak]])
        predicted_fare = float(model.predict(features)[0])

        # Clamp to minimum viable fare
        min_fare = RATE_CARD[ride_type][0]
        predicted_fare = max(predicted_fare, min_fare)

        # Compute breakdown
        base, per_km = RATE_CARD[ride_type]
        base_fare = base + per_km * distance_km
        traffic_surcharge = round(base_fare * (traffic - 1.0), 2)
        surge_amount = round(base_fare * (surge - 1.0), 2)

        breakdown = {
            "base_fare": round(base_fare, 2),
            "traffic_surcharge": traffic_surcharge,
            "surge_amount": surge_amount,
            "total_fare": round(predicted_fare, 2),
            "currency": "INR",
        }

        return {
            "estimated_fare": round(predicted_fare, 2),
            "surge_multiplier": round(surge, 2),
            "breakdown": breakdown,
            "model_used": "RandomForestRegressor(n_estimators=100)",
        }
