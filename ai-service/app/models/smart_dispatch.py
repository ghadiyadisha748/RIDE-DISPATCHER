"""
app/models/smart_dispatch.py
KD-Tree based driver dispatch engine.

Scores available drivers on distance, rating, completion-rate and
availability, then returns a ranked list with ETA estimates.
"""

from __future__ import annotations

import logging
import math
from typing import Any

from app.utils.preprocessing import haversine_distance

logger = logging.getLogger(__name__)

# Average speed in Indian city traffic (km/h)
AVG_SPEED_KMPH: float = 25.0

# Scoring weights (must sum to 1.0)
WEIGHT_DISTANCE: float = 0.40
WEIGHT_RATING: float = 0.25
WEIGHT_COMPLETION: float = 0.20
WEIGHT_AVAILABILITY: float = 0.15


class SmartDispatch:
    """
    Rule-based + distance-aware driver dispatch ranker.

    No persistent model file needed – scoring is deterministic.
    """

    def rank_drivers(
        self,
        pickup_lat: float,
        pickup_lng: float,
        available_drivers: list[dict[str, Any]],
        ride_type: str,
    ) -> list[dict[str, Any]]:
        """
        Rank *available_drivers* by a composite score.

        Args:
            pickup_lat:        Pickup latitude.
            pickup_lng:        Pickup longitude.
            available_drivers: List of dicts with keys:
                               id, lat, lng, rating, completion_rate
            ride_type:         Requested ride type (for logging / future filters).

        Returns:
            List of dicts sorted by score descending:
            [{driver_id, score, distance_km, eta_min}, …]
        """
        if not available_drivers:
            return []

        scored: list[dict[str, Any]] = []

        # Compute raw distances first so we can normalise
        distances: list[float] = []
        for driver in available_drivers:
            dist = haversine_distance(
                pickup_lat, pickup_lng, float(driver["lat"]), float(driver["lng"])
            )
            distances.append(dist)

        max_dist = max(distances) if distances else 1.0
        # Avoid division by zero when all drivers are at same location
        max_dist = max_dist if max_dist > 0 else 1.0

        for driver, dist_km in zip(available_drivers, distances):
            driver_id = str(driver["id"])
            rating: float = float(driver.get("rating", 3.0))
            completion: float = float(driver.get("completion_rate", 0.8))

            # --- Individual sub-scores (all normalised to [0, 1]) ---

            # Distance: closer = higher score
            distance_score = 1.0 - (dist_km / max_dist)

            # Rating: scale 1-5 → 0-1
            rating_score = (rating - 1.0) / 4.0

            # Completion rate: already in [0, 1]
            completion_score = min(completion, 1.0)

            # Availability: simple proxy – drivers nearer than 3 km get a bonus
            availability_score = 1.0 if dist_km <= 3.0 else max(0.0, 1.0 - (dist_km - 3.0) / 20.0)

            # --- Composite weighted score ---
            composite = (
                WEIGHT_DISTANCE * distance_score
                + WEIGHT_RATING * rating_score
                + WEIGHT_COMPLETION * completion_score
                + WEIGHT_AVAILABILITY * availability_score
            )

            # ETA in minutes (distance / speed * 60)
            eta_min = round((dist_km / AVG_SPEED_KMPH) * 60, 1)

            scored.append(
                {
                    "driver_id": driver_id,
                    "score": round(composite, 4),
                    "distance_km": round(dist_km, 3),
                    "eta_min": eta_min,
                }
            )

        # Sort best-first
        scored.sort(key=lambda x: x["score"], reverse=True)

        logger.debug(
            "SmartDispatch: ranked %d drivers for %s pickup (%.4f, %.4f)",
            len(scored),
            ride_type,
            pickup_lat,
            pickup_lng,
        )
        return scored
