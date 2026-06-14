"""
app/models/demand_forecaster.py
XGBoost ride-demand forecaster for Indian urban areas.

Generates synthetic demand data reflecting Indian city patterns
(morning / evening peaks, weekend uplift, holiday spikes) and trains
an XGBRegressor.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from xgboost import XGBRegressor

from app.utils.preprocessing import encode_area, get_surge_multiplier, is_peak_hour

logger = logging.getLogger(__name__)

# Peak hours for display
MORNING_PEAK = list(range(7, 11))   # 07–10
EVENING_PEAK = list(range(17, 22))  # 17–21

DEMAND_LEVELS = [
    (80,  "very_high"),
    (50,  "high"),
    (25,  "moderate"),
    (0,   "low"),
]


def _demand_level(count: int) -> str:
    for threshold, label in DEMAND_LEVELS:
        if count >= threshold:
            return label
    return "low"


class DemandForecaster:
    """XGBoost model predicting ride demand per area/time slot."""

    MODEL_FILENAME = "demand_model.joblib"
    FEATURES = ["hour", "day_of_week", "is_weekend", "is_holiday", "area_encoded"]

    def __init__(self, model_dir: str = "trained_models") -> None:
        self.model_dir = Path(model_dir)
        self.model_path = self.model_dir / self.MODEL_FILENAME
        self._model: XGBRegressor | None = None

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def _generate_training_data(self, n_samples: int = 2000) -> pd.DataFrame:
        """Create labelled demand dataset reflecting Indian city patterns."""
        rng = np.random.default_rng(42)

        hours = rng.integers(0, 24, n_samples)
        days = rng.integers(0, 7, n_samples)
        is_weekends = (days >= 5).astype(int)
        # ~10 % holiday rate
        is_holidays = rng.choice([0, 1], n_samples, p=[0.90, 0.10])
        areas = rng.integers(0, 100, n_samples)

        demands = np.zeros(n_samples)
        for i in range(n_samples):
            h = int(hours[i])
            d = int(days[i])
            weekend = bool(is_weekends[i])
            holiday = bool(is_holidays[i])

            # Base demand by hour
            if h in range(7, 11):          # morning rush
                base = rng.uniform(60, 100)
            elif h in range(17, 22):        # evening rush
                base = rng.uniform(70, 120)
            elif h in range(12, 15):        # lunch
                base = rng.uniform(30, 55)
            elif h in range(22, 24):        # late night
                base = rng.uniform(10, 30)
            elif h in range(0, 6):          # deep night
                base = rng.uniform(3, 15)
            else:
                base = rng.uniform(20, 45)

            if weekend:
                # Weekend evenings are busier
                if h in range(18, 23):
                    base *= rng.uniform(1.2, 1.5)
                else:
                    base *= rng.uniform(0.9, 1.1)

            if holiday:
                base *= rng.uniform(1.3, 1.8)

            # Area variation
            area_factor = 0.8 + (areas[i] % 10) / 20.0  # 0.8–1.3
            demands[i] = max(1, int(base * area_factor + rng.normal(0, 3)))

        df = pd.DataFrame(
            {
                "hour": hours.astype(int),
                "day_of_week": days.astype(int),
                "is_weekend": is_weekends,
                "is_holiday": is_holidays,
                "area_encoded": areas.astype(int),
                "demand": demands.astype(int),
            }
        )
        return df

    def train(self) -> None:
        """Train XGBRegressor on synthetic demand data and persist the model."""
        logger.info("DemandForecaster: generating training data …")
        df = self._generate_training_data(2000)

        X = df[self.FEATURES].values
        y = df["demand"].values

        model = XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1,
        )
        model.fit(X, y)

        self.model_dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(model, self.model_path)
        self._model = model
        logger.info("DemandForecaster: model trained and saved → %s", self.model_path)

    def _load_model(self) -> XGBRegressor:
        if self._model is None:
            if not self.model_path.exists():
                logger.info("DemandForecaster: no saved model – training now …")
                self.train()
            else:
                self._model = joblib.load(self.model_path)
                logger.info("DemandForecaster: loaded from %s", self.model_path)
        return self._model  # type: ignore[return-value]

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def predict(self, data: dict[str, Any]) -> dict[str, Any]:
        """
        Predict demand for a given area/time slot.

        Expected keys: area_name, city, hour_of_day, day_of_week, is_weekend
        """
        model = self._load_model()

        hour: int = int(data["hour_of_day"])
        day: int = int(data["day_of_week"])
        is_weekend: int = int(data.get("is_weekend", day >= 5))
        is_holiday: int = 0  # default; could be extended with a holiday calendar
        area_encoded: int = encode_area(str(data.get("area_name", "unknown")))

        features = np.array([[hour, day, is_weekend, is_holiday, area_encoded]])
        raw_demand = float(model.predict(features)[0])
        demand = max(1, int(round(raw_demand)))

        surge = get_surge_multiplier(hour, day)
        level = _demand_level(demand)

        # Peak hours for this area (static for now – could be area-specific)
        peak_hours = MORNING_PEAK + EVENING_PEAK

        return {
            "predicted_demand": demand,
            "demand_level": level,
            "surge_multiplier": round(surge, 2),
            "peak_hours": peak_hours,
        }
