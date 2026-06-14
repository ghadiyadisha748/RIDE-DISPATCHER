"""
app/models/sentiment_analyzer.py
TF-IDF + Logistic Regression sentiment classifier for Indian ride reviews.

Generates labelled training data (500 samples), trains the pipeline,
and exposes a predict() method that returns sentiment + class probabilities.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Seed corpus for each sentiment class
# ---------------------------------------------------------------------------

_POSITIVE_SEEDS = [
    "excellent driver very punctual",
    "clean vehicle smooth ride great experience",
    "driver was very polite and helpful",
    "reached on time amazing service",
    "very comfortable ride highly recommend",
    "best auto ride ever driver so friendly",
    "ac was working perfectly cool ride",
    "driver knew all shortcuts arrived early",
    "five star driver great music playing",
    "very professional behaviour top notch service",
    "quick pickup no waiting time at all",
    "driver helped with luggage very kind",
    "safe driving loved the experience",
    "cab was spotlessly clean wonderful trip",
    "on time pickup polite driver will book again",
    "bike rider was fast and safe",
    "premium cab felt like a business class",
    "driver waited patiently no rush excellent",
    "great value for money superb ride",
    "booking was instant driver came in 3 minutes",
]

_NEUTRAL_SEEDS = [
    "average ride nothing special okay service",
    "took slightly longer route but reached",
    "driver was decent ride was okay",
    "normal experience no complaints no praise",
    "it was an average cab ride",
    "driver did not talk much but drove fine",
    "okay service could be better",
    "reached destination on time nothing extra",
    "standard ride expected nothing more",
    "vehicle was clean but driver was quiet",
    "acceptable service for the price paid",
    "bike was old but ride was okay",
    "moderate experience average driver",
    "nothing to complain about but nothing wow",
    "typical auto ride in the city",
]

_NEGATIVE_SEEDS = [
    "driver was rude and argued about route",
    "vehicle was very dirty smelled bad",
    "overcharged me did not follow meter",
    "driver cancelled after accepting my ride",
    "very late pickup waited 30 minutes",
    "driver was on phone entire journey unsafe",
    "bad experience will never book again",
    "driver took wrong route and charged extra",
    "ac was not working in peak summer horrible",
    "very rough driving almost had an accident",
    "driver demanded cash and refused card",
    "ride was cancelled at last minute",
    "driver behaviour was very unprofessional rude",
    "auto was in terrible condition broken seats",
    "waited 20 minutes driver did not arrive",
    "driver was abusive and threatened me",
    "unfair surge pricing during light traffic",
    "booking confirmed but driver never came",
    "bike rider drove dangerously overspeeding",
    "terrible service worst cab experience ever",
]

# Label index
LABELS = ["negative", "neutral", "positive"]


def _build_corpus() -> tuple[list[str], list[int]]:
    """Build a synthetic labelled corpus by augmenting seed phrases."""
    rng = np.random.default_rng(42)
    texts: list[str] = []
    labels: list[int] = []

    buckets = [
        (_NEGATIVE_SEEDS, 0),
        (_NEUTRAL_SEEDS,  1),
        (_POSITIVE_SEEDS, 2),
    ]

    for seeds, label_idx in buckets:
        target = 500 // 3
        for _ in range(target):
            # Randomly pick 1-3 seed phrases and concatenate
            n_pick = rng.integers(1, 4)
            idxs = rng.choice(len(seeds), size=min(n_pick, len(seeds)), replace=False)
            text = " ".join(seeds[i] for i in idxs)
            texts.append(text)
            labels.append(label_idx)

    return texts, labels


class SentimentAnalyzer:
    """TF-IDF + Logistic Regression sentiment classifier."""

    MODEL_FILENAME = "sentiment_model.joblib"

    def __init__(self, model_dir: str = "trained_models") -> None:
        self.model_dir = Path(model_dir)
        self.model_path = self.model_dir / self.MODEL_FILENAME
        self._pipeline: Pipeline | None = None

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train(self) -> None:
        """Build corpus, train TF-IDF + LR pipeline, save model."""
        logger.info("SentimentAnalyzer: building training corpus …")
        texts, labels = _build_corpus()

        pipeline = Pipeline(
            [
                (
                    "tfidf",
                    TfidfVectorizer(
                        ngram_range=(1, 2),
                        min_df=1,
                        max_features=5000,
                        sublinear_tf=True,
                    ),
                ),
                (
                    "clf",
                    LogisticRegression(
                        C=1.0,
                        max_iter=1000,
                        random_state=42,
                        multi_class="multinomial",
                        solver="lbfgs",
                    ),
                ),
            ]
        )
        pipeline.fit(texts, labels)

        self.model_dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(pipeline, self.model_path)
        self._pipeline = pipeline
        logger.info("SentimentAnalyzer: model trained and saved → %s", self.model_path)

    def _load_pipeline(self) -> Pipeline:
        if self._pipeline is None:
            if not self.model_path.exists():
                logger.info("SentimentAnalyzer: no saved model – training now …")
                self.train()
            else:
                self._pipeline = joblib.load(self.model_path)
                logger.info("SentimentAnalyzer: loaded from %s", self.model_path)
        return self._pipeline  # type: ignore[return-value]

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def predict(self, text: str) -> dict[str, Any]:
        """
        Classify *text* as positive / neutral / negative.

        Returns:
            {sentiment, confidence, scores: {positive, neutral, negative}}
        """
        pipeline = self._load_pipeline()
        proba = pipeline.predict_proba([text])[0]

        # proba order: [negative, neutral, positive] (alphabetical)
        scores = {LABELS[i]: round(float(p), 4) for i, p in enumerate(proba)}
        predicted_idx = int(np.argmax(proba))
        sentiment = LABELS[predicted_idx]
        confidence = round(float(proba[predicted_idx]), 4)

        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "scores": scores,
        }
