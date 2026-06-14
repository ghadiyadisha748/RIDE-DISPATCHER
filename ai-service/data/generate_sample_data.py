"""
data/generate_sample_data.py
Generate a synthetic ride dataset for Surat, India.

Outputs: data/surat_rides.csv  (1000 rows)

Usage:
    python data/generate_sample_data.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Allow running from repo root
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SEED = 42
N_ROWS = 1000
OUTPUT_FILE = Path(__file__).parent / "surat_rides.csv"

SURAT_AREAS = [
    "Adajan", "Althan", "Athwa", "Bhatar", "Citylight",
    "Dumas", "Ghod Dod Road", "Katargam", "Magdalla", "Majura Gate",
    "Nanpura", "Piplod", "Rundh", "Sarthana", "Udhna",
    "Varachha", "Vesu", "Pal", "Rander", "Sachin",
]

RIDE_TYPES = ["auto", "bike", "cab", "premium"]

RATE_CARD = {
    "auto":    (25.0,  8.0),
    "bike":    (15.0,  5.0),
    "cab":     (40.0, 12.0),
    "premium": (80.0, 20.0),
}

# Approximate GPS bounding box for Surat city
LAT_RANGE = (21.10, 21.25)
LNG_RANGE = (72.75, 72.92)

# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------

def generate_dataset(n: int = N_ROWS) -> pd.DataFrame:
    rng = np.random.default_rng(SEED)

    ride_types = rng.choice(RIDE_TYPES, n)
    hours = rng.integers(0, 24, n)
    days = rng.integers(0, 7, n)
    distances = rng.uniform(0.5, 40.0, n)
    traffic_factors = rng.uniform(1.0, 2.0, n)
    pickup_areas = rng.choice(SURAT_AREAS, n)
    dropoff_areas = rng.choice(SURAT_AREAS, n)

    pickup_lats = rng.uniform(*LAT_RANGE, n)
    pickup_lngs = rng.uniform(*LNG_RANGE, n)
    dropoff_lats = rng.uniform(*LAT_RANGE, n)
    dropoff_lngs = rng.uniform(*LNG_RANGE, n)

    ratings = rng.uniform(1.0, 5.0, n).round(1)
    is_weekends = (days >= 5).astype(int)

    # Surge multiplier by hour
    def surge(h: int, d: int) -> float:
        is_we = d >= 5
        if 0 <= h <= 5:
            return 0.9
        if h in range(7, 11):
            return 1.6 if h in (8, 9) else 1.3
        if h in range(17, 22):
            base = 1.8 if h in (18, 19, 20) else 1.4
            return base + (0.2 if is_we and d in (4, 5) else 0.0)
        return 1.0

    surges = np.array([surge(int(hours[i]), int(days[i])) for i in range(n)])

    # Base fare calculation
    fares = np.zeros(n)
    for i in range(n):
        rt = ride_types[i]
        base, per_km = RATE_CARD[rt]
        fares[i] = (base + per_km * distances[i]) * surges[i] * traffic_factors[i]
        fares[i] *= rng.uniform(0.90, 1.10)  # noise
        fares[i] = round(max(fares[i], base), 2)

    # Driver behaviour columns
    driver_ratings = rng.uniform(2.5, 5.0, n).round(1)
    completion_rates = rng.uniform(0.6, 1.0, n).round(2)
    response_times = rng.uniform(10, 180, n).round(0).astype(int)
    cancellation_rates = rng.uniform(0.0, 0.4, n).round(2)

    # Payment
    payment_methods = rng.choice(["upi", "cash", "card", "wallet"], n, p=[0.45, 0.30, 0.15, 0.10])

    # Ride status
    statuses = rng.choice(
        ["completed", "cancelled_by_user", "cancelled_by_driver", "ongoing"],
        n,
        p=[0.80, 0.10, 0.06, 0.04],
    )

    df = pd.DataFrame(
        {
            "ride_id": [f"RD{str(i+1).zfill(6)}" for i in range(n)],
            "city": "Surat",
            "pickup_area": pickup_areas,
            "dropoff_area": dropoff_areas,
            "pickup_lat": pickup_lats.round(6),
            "pickup_lng": pickup_lngs.round(6),
            "dropoff_lat": dropoff_lats.round(6),
            "dropoff_lng": dropoff_lngs.round(6),
            "ride_type": ride_types,
            "distance_km": distances.round(2),
            "hour_of_day": hours.astype(int),
            "day_of_week": days.astype(int),
            "is_weekend": is_weekends,
            "traffic_factor": traffic_factors.round(2),
            "surge_multiplier": surges.round(2),
            "estimated_fare_inr": fares,
            "passenger_rating": ratings,
            "driver_rating": driver_ratings,
            "driver_completion_rate": completion_rates,
            "driver_response_time_sec": response_times,
            "driver_cancellation_rate": cancellation_rates,
            "payment_method": payment_methods,
            "ride_status": statuses,
        }
    )
    return df


def main() -> None:
    print(f"Generating {N_ROWS} synthetic Surat ride records …")
    df = generate_dataset(N_ROWS)
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"Saved to: {OUTPUT_FILE}")
    print(df.describe().to_string())
    print(f"\nRide type distribution:\n{df['ride_type'].value_counts().to_string()}")
    print(f"\nStatus distribution:\n{df['ride_status'].value_counts().to_string()}")


if __name__ == "__main__":
    main()
