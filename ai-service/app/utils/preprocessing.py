"""
app/utils/preprocessing.py
Shared preprocessing helpers used across ML models and routers.
"""

from __future__ import annotations

import math


# ---------------------------------------------------------------------------
# Geo helpers
# ---------------------------------------------------------------------------

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great-circle distance between two GPS coordinates.

    Args:
        lat1, lng1: Origin latitude/longitude in decimal degrees.
        lat2, lng2: Destination latitude/longitude in decimal degrees.

    Returns:
        Distance in kilometres.
    """
    R = 6371.0  # Earth radius in km

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# ---------------------------------------------------------------------------
# Encoding helpers
# ---------------------------------------------------------------------------

RIDE_TYPE_MAP: dict[str, int] = {
    "auto": 0,
    "bike": 1,
    "cab": 2,
    "premium": 3,
}


def encode_ride_type(ride_type: str) -> int:
    """Map a ride-type string to an integer label (0-3)."""
    return RIDE_TYPE_MAP.get(ride_type.lower(), 2)  # default: cab


def encode_area(area_name: str) -> int:
    """
    Hash-based area encoding.
    Returns a deterministic integer in [0, 99] for any area string.
    """
    return abs(hash(area_name.strip().lower())) % 100


# ---------------------------------------------------------------------------
# Time / surge helpers
# ---------------------------------------------------------------------------

# Morning peak: 7-10, Evening peak: 17-21
PEAK_MORNING = range(7, 11)   # 07:00–10:59
PEAK_EVENING = range(17, 22)  # 17:00–21:59


def is_peak_hour(hour: int) -> bool:
    """Return True if *hour* falls in Indian urban peak travel windows."""
    return hour in PEAK_MORNING or hour in PEAK_EVENING


def get_surge_multiplier(hour: int, day_of_week: int) -> float:
    """
    Compute a surge multiplier based on time of day and day of week.

    Rules:
    - Midnight (0-5): slight discount  → 0.9
    - Morning peak (7-10): 1.3 – 1.8
    - Evening peak (17-21): 1.4 – 2.0
    - Weekend evening (Fri/Sat, 18-22): +0.2 on top
    - Otherwise: 1.0
    """
    is_weekend = day_of_week in (4, 5, 6)  # Fri, Sat, Sun

    if 0 <= hour <= 5:
        return 0.9

    if hour in PEAK_MORNING:
        # Steepest at 8-9 am
        base = 1.5 if hour in (8, 9) else 1.3
        return base + (0.2 if is_weekend else 0.0)

    if hour in PEAK_EVENING:
        # Steepest at 18-20
        base = 1.8 if hour in (18, 19, 20) else 1.4
        return base + (0.2 if is_weekend and day_of_week in (4, 5) else 0.0)

    return 1.0
