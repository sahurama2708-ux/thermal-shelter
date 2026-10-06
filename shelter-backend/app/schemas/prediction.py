from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    month: int = Field(ge=1, le=12)
    hill_station: int = Field(ge=0, le=1)


class PredictionResponse(BaseModel):
    thermal_condition: str
    confidence: float
    climate_regime: int


class ShelterDesign(BaseModel):
    roof: str
    walls: str
    ventilation: str
    shading: str
    priority: str


class RecommendationResponse(BaseModel):
    thermal_condition: str
    confidence: float
    climate_regime: int
    design: ShelterDesign


class PredictionHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    latitude: float
    longitude: float
    month: int
    hill_station: int
    thermal_condition: str
    confidence: float
    climate_regime: int
    weather_data: dict
    design: dict
    created_at: datetime


class PaginatedHistoryResponse(BaseModel):
    items: list[PredictionHistoryItem]
    page: int
    page_size: int
    total: int
    total_pages: int
