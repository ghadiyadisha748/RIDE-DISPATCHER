"""
app/models/fraud_detector.py
Isolation Forest anomaly / fraud detection model.

Trains on synthetic normal + anomalous user behaviour data and
provides a fraud score, risk level, and human-readable flags.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

# Feature column order (must match prediction input)
FEATURE_COLS = [
    "cancellation_rate",
    "booking_frequency",
    "avg_distance",
    "payment_failures",
    "account_age_days",
]

# Risk thresholds on the normalised fraud score (0=clean, 1=fraud)
RISK_LEVELS = [
    (0.75, "critical"),
    (0.50, "high"),
    (0.25, "medium"),
    (0.0,  "low"),
]


def _risk_level(score: float) -> str:
    for threshold, label in RISK_LEVELS:
        if score >= threshold:
            return label
    return "low"


def _build_flags(data: dict[str, Any]) -> list[str]:
    """Return a list of human-readable risk flags based on feature values."""
    flags: list[str] = []

    if float(data.get("cancellation_rate", 0)) > 0.5:
        flags.append("High cancellation rate (>50%)")
    if float(data.get("booking_frequency", 0)) > 8:
        flags.append("Unusually high booking frequency (>8 rides/day)")
    if int(data.get("payment_failures", 0)) > 3:
        flags.append("Multiple payment failures detected")
    if int(data.get("account_age_days", 999)) < 7:
        flags.append("Very new account (<7 days old)")
    if float(data.get("avg_distance", 0)) > 45:
        flags.append("Abnormally long average trip distance")
    if float(data.get("avg_distance", 0)) < 0.5 and float(data.get("booking_frequency", 0)) > 3:
        flags.append("Suspicious pattern: many very-short trips")

    return flags


class FraudDetector:
    """Isolation Forest anomaly detector for user fraud detection."""

    MODEL_FILENAME = "fraud_model.joblib"

    def __init__(self, model_dir: str = "trained_models") -> None:
        self.model_dir = Path(model_dir)
        self.model_path = self.model_dir / self.MODEL_FILENAME
        self._pipeline: Pipeline | None = None

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def _generate_training_data(self) -> pd.DataFrame:
        """Generate normal behaviour data with injected anomalies (10 %)."""
        rng = np.random.default_rng(42)
        n_normal = 900
        n_anomaly = 100

        # Normal users
        normal = pd.DataFrame(
            {
                "cancellation_rate": rng.uniform(0.0, 0.30, n_normal),
                "booking_frequency": rng.uniform(0.5, 3.0, n_normal),
                "avg_distance": rng.uniform(2.0, 25.0, n_normal),
                "payment_failures": rng.integers(0, 3, n_normal),
                "account_age_days": rng.integers(30, 1000, n_normal),
            }
        )

        # Fraudulent / anomalous users
        anomaly = pd.DataFrame(
            {
                "cancellation_rate": rng.uniform(0.70, 1.0, n_anomaly),
                "booking_frequency": rng.uniform(10.0, 30.0, n_anomaly),
                "avg_distance": np.concatenate(
                    [rng.uniform(0.1, 0.4, n_anomaly // 2),
                     rng.uniform(45.0, 80.0, n_anomaly // 2)]
                ),
                "payment_failures": rng.integers(5, 20, n_anomaly),
                "account_age_days": rng.integers(0, 10, n_anomaly),
            }
        )

        return pd.concat([normal, anomaly], ignore_index=True)

    def train(self) -> None:
        """Train IsolationForest on synthetic data and save the model."""
        logger.info("FraudDetector: generating training data …")
        df = self._generate_training_data()

        X = df[FEATURE_COLS].values

        pipeline = Pipeline(
            [
                ("scaler", StandardScaler()),
                (
                    "iso_forest",
                    IsolationForest(
                        n_estimators=150,
                        contamination=0.10,
                        random_state=42,
                        n_jobs=-1,
                    ),
                ),
            ]
        )
        pipeline.fit(X)

        self.model_dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(pipeline, self.model_path)
        self._pipeline = pipeline
        logger.info("FraudDetector: model trained and saved → %s", self.model_path)

    def _load_pipeline(self) -> Pipeline:
        if self._pipeline is None:
            if not self.model_path.exists():
                logger.info("FraudDetector: no saved model – training now …")
                self.train()
            else:
                self._pipeline = joblib.load(self.model_path)
                logger.info("FraudDetector: loaded from %s", self.model_path)
        return self._pipeline  # type: ignore[return-value]

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def predict(self, data: dict[str, Any]) -> dict[str, Any]:
        """
        Assess a user for fraud / anomalous behaviour.

        Expected keys: user_id, cancellation_rate, booking_frequency,
                       avg_distance, payment_failures, account_age_days
        """
        pipeline = self._load_pipeline()

        features = np.array(
            [[
                float(data.get("cancellation_rate", 0)),
                float(data.get("booking_frequency", 1)),
                float(data.get("avg_distance", 5)),
                int(data.get("payment_failures", 0)),
                int(data.get("account_age_days", 365)),
            ]]
        )

        # IsolationForest: -1 = anomaly, +1 = normal
        iso: IsolationForest = pipeline.named_steps["iso_forest"]
        scaled = pipeline.named_steps["scaler"].transform(features)

        raw_score = iso.score_samples(scaled)[0]  # lower = more anomalous
        # Normalise to [0, 1]: score_samples range is roughly [-0.5, 0]
        # We map so that the most anomalous → 1 and normal → 0
        # Empirical: scores typically in [-0.5, 0.1]
        fraud_score = float(np.clip((-raw_score - 0.0) / 0.5, 0.0, 1.0))

        is_fraud = bool(pipeline.predict(features)[0] == -1)
        risk = _risk_level(fraud_score)
        flags = _build_flags(data)

        return {
            "is_fraud": is_fraud,
            "fraud_score": round(fraud_score, 4),
            "risk_level": risk,
            "flags": flags,
        }
