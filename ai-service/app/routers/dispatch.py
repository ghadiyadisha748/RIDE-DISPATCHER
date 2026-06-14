"""
app/routers/dispatch.py
Smart driver dispatch endpoint.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.schemas.requests import DispatchRequest, DispatchResponse, RankedDriver
from app.utils.model_loader import get_loader

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dispatch", tags=["Smart Dispatch"])


@router.post(
    "/rank",
    response_model=DispatchResponse,
    summary="Rank available drivers for a pickup",
    description=(
        "Given a pickup location and a list of available drivers, returns drivers ranked "
        "by a composite score (distance 40%, rating 25%, completion rate 20%, "
        "availability 15%) with ETA estimates."
    ),
)
async def rank_drivers(request: DispatchRequest) -> DispatchResponse:
    """Return a ranked list of drivers best suited for the pickup."""
    try:
        engine = get_loader().get_dispatch_engine()
        # Convert DriverInfo pydantic objects to plain dicts
        drivers_raw = [d.model_dump() for d in request.available_drivers]
        ranked = engine.rank_drivers(
            pickup_lat=request.pickup_lat,
            pickup_lng=request.pickup_lng,
            available_drivers=drivers_raw,
            ride_type=request.ride_type,
        )
        return DispatchResponse(ranked_drivers=[RankedDriver(**d) for d in ranked])
    except Exception as exc:
        logger.exception("Dispatch ranking failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Dispatch error: {exc}") from exc
