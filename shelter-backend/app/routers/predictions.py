import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.prediction import PredictionHistory
from app.models.user import User
from app.schemas.prediction import (
    PaginatedHistoryResponse,
    PredictionHistoryItem,
    PredictionRequest,
    PredictionResponse,
    RecommendationResponse,
)
from app.services import features as feature_service
from app.services import recommender
from app.services.weather import WeatherServiceError, get_weather_for_month
from app.utils.responses import error, success

router = APIRouter(prefix="/api/v1/predictions", tags=["predictions"])


async def _run_pipeline(payload: PredictionRequest) -> dict:
    try:
        weather = await get_weather_for_month(payload.latitude, payload.longitude, payload.month)
    except WeatherServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error("WEATHER_SERVICE_UNAVAILABLE", str(exc)),
        ) from exc

    result = feature_service.run_full_pipeline(
        latitude=payload.latitude,
        longitude=payload.longitude,
        month=payload.month,
        hill_station=payload.hill_station,
        weather=weather,
    )
    return result


@router.post("/predict", response_model=None)
async def predict(
    payload: PredictionRequest,
    current_user: User = Depends(get_current_user),
):
    result = await _run_pipeline(payload)
    return success(
        PredictionResponse(
            thermal_condition=result["thermal_condition"],
            confidence=round(result["confidence"], 2),
            climate_regime=result["climate_regime"],
        )
    )


@router.post("/recommend", response_model=None)
async def recommend(
    payload: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = await _run_pipeline(payload)
    design = recommender.get_design_for_condition(result["thermal_condition"])

    history_entry = PredictionHistory(
        user_id=current_user.id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        month=payload.month,
        hill_station=payload.hill_station,
        thermal_condition=result["thermal_condition"],
        confidence=round(result["confidence"], 2),
        climate_regime=result["climate_regime"],
        weather_data=result["weather"],
        design=design,
    )
    db.add(history_entry)
    db.commit()

    return success(
        RecommendationResponse(
            thermal_condition=result["thermal_condition"],
            confidence=round(result["confidence"], 2),
            climate_regime=result["climate_regime"],
            design=design,
        )
    )


@router.get("/history", response_model=None)
def get_history(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base_query = db.query(PredictionHistory).filter(PredictionHistory.user_id == current_user.id)
    total = base_query.count()
    total_pages = max(1, math.ceil(total / page_size))

    items = (
        base_query.order_by(PredictionHistory.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return success(
        PaginatedHistoryResponse(
            items=[PredictionHistoryItem.model_validate(item) for item in items],
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )
    )


def _get_owned_history_or_404(db: Session, current_user: User, prediction_id: str) -> PredictionHistory:
    entry = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.id == prediction_id, PredictionHistory.user_id == current_user.id)
        .first()
    )
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error("PREDICTION_NOT_FOUND", "Prediction history record not found"),
        )
    return entry


@router.get("/history/{prediction_id}", response_model=None)
def get_history_item(
    prediction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = _get_owned_history_or_404(db, current_user, prediction_id)
    return success(PredictionHistoryItem.model_validate(entry))


@router.delete("/history/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history_item(
    prediction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = _get_owned_history_or_404(db, current_user, prediction_id)
    db.delete(entry)
    db.commit()
    return None
