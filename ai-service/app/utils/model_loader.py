"""
app/utils/model_loader.py
Singleton model registry with lazy loading.

All model instances are cached after the first load so that subsequent
requests reuse the in-memory objects without re-reading from disk.
"""

from __future__ import annotations

import logging
from threading import Lock

from app.config import settings
from app.models.demand_forecaster import DemandForecaster
from app.models.driver_performance import DriverPerformanceAnalyzer
from app.models.fare_predictor import FarePredictor
from app.models.fraud_detector import FraudDetector
from app.models.sentiment_analyzer import SentimentAnalyzer
from app.models.smart_dispatch import SmartDispatch

logger = logging.getLogger(__name__)


class ModelLoader:
    """Thread-safe singleton registry for all AI model instances."""

    _instance: "ModelLoader | None" = None
    _lock: Lock = Lock()

    def __new__(cls) -> "ModelLoader":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    obj = super().__new__(cls)
                    obj._initialized = False  # type: ignore[attr-defined]
                    cls._instance = obj
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:  # type: ignore[attr-defined]
            return
        self._model_dir = settings.MODEL_DIR
        self._fare_predictor: FarePredictor | None = None
        self._dispatch_engine: SmartDispatch | None = None
        self._demand_forecaster: DemandForecaster | None = None
        self._sentiment_analyzer: SentimentAnalyzer | None = None
        self._fraud_detector: FraudDetector | None = None
        self._driver_analyzer: DriverPerformanceAnalyzer | None = None
        self._initialized = True

    # ------------------------------------------------------------------
    # Public accessors (lazy load + auto-train)
    # ------------------------------------------------------------------

    def get_fare_predictor(self) -> FarePredictor:
        if self._fare_predictor is None:
            logger.info("ModelLoader: initialising FarePredictor …")
            self._fare_predictor = FarePredictor(model_dir=self._model_dir)
        return self._fare_predictor

    def get_dispatch_engine(self) -> SmartDispatch:
        if self._dispatch_engine is None:
            logger.info("ModelLoader: initialising SmartDispatch …")
            self._dispatch_engine = SmartDispatch()
        return self._dispatch_engine

    def get_demand_forecaster(self) -> DemandForecaster:
        if self._demand_forecaster is None:
            logger.info("ModelLoader: initialising DemandForecaster …")
            self._demand_forecaster = DemandForecaster(model_dir=self._model_dir)
        return self._demand_forecaster

    def get_sentiment_analyzer(self) -> SentimentAnalyzer:
        if self._sentiment_analyzer is None:
            logger.info("ModelLoader: initialising SentimentAnalyzer …")
            self._sentiment_analyzer = SentimentAnalyzer(model_dir=self._model_dir)
        return self._sentiment_analyzer

    def get_fraud_detector(self) -> FraudDetector:
        if self._fraud_detector is None:
            logger.info("ModelLoader: initialising FraudDetector …")
            self._fraud_detector = FraudDetector(model_dir=self._model_dir)
        return self._fraud_detector

    def get_driver_analyzer(self) -> DriverPerformanceAnalyzer:
        if self._driver_analyzer is None:
            logger.info("ModelLoader: initialising DriverPerformanceAnalyzer …")
            self._driver_analyzer = DriverPerformanceAnalyzer()
        return self._driver_analyzer

    # ------------------------------------------------------------------
    # Bulk operations
    # ------------------------------------------------------------------

    def train_all(self) -> None:
        """Train all ML models that support training (called at startup)."""
        logger.info("ModelLoader: training all models …")
        self.get_fare_predictor().train()
        self.get_demand_forecaster().train()
        self.get_sentiment_analyzer().train()
        self.get_fraud_detector().train()
        logger.info("ModelLoader: all models trained successfully.")

    def warm_up(self) -> None:
        """
        Ensure all models are loaded into memory.
        If a model file is missing it will be trained automatically.
        """
        logger.info("ModelLoader: warming up all models …")
        self.get_fare_predictor()._load_model()
        self.get_dispatch_engine()
        self.get_demand_forecaster()._load_model()
        self.get_sentiment_analyzer()._load_pipeline()
        self.get_fraud_detector()._load_pipeline()
        self.get_driver_analyzer()
        logger.info("ModelLoader: warm-up complete.")


# Convenience singleton accessor
def get_loader() -> ModelLoader:
    """Return the global ModelLoader singleton."""
    return ModelLoader()
