"""
app/routers/demand.py
Ride demand forecasting endpoint.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.schemas.requests import DemandRequest, DemandResponse
from app.utils.model_loader import get_loader

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/demand", tags=["Demand Forecasting"])


@router.post(
    "/forecast",
    response_model=DemandResponse,
    summary="Forecast ride demand for an area/time",
    description=(
        "Predicts the number of ride requests expected for the given area, city, "
        "and time slot. Returns a demand count, level classification, surge multiplier, "
        "and the typical peak hours for the area."
    ),
)
async def forecast_demand(request: DemandRequest) -> DemandResponse:
    """Forecast ride demand for a given area and time slot."""
    try:
        forecaster = get_loader().get_demand_forecaster()
        result = forecaster.predict(request.model_dump())
        return DemandResponse(**result)
    except Exception as exc:
        logger.exception("Demand forecast failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Demand forecast error: {exc}") from exc
