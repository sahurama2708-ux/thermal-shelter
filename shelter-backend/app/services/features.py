"""
Exact reproduction of the notebook's feature engineering (Untitled2_FIXED.ipynb,
section 18 / cell 139) for a single inference request. Nothing here invents a
new feature or changes ordering - the final DataFrame is reindexed with
model_service.nn_feature_order immediately before scaling, so ordering is
always taken from the saved artifact, never assumed.
"""
import numpy as np

from app.services.model import model_service


def heat_humidity_index(t2m: float, rh2m: float) -> float:
    return t2m + 0.33 * (rh2m / 100 * 6.105 * np.exp((17.27 * t2m) / (237.7 + t2m))) - 4


def build_feature_row(
    *,
    latitude: float,
    longitude: float,
    t2m: float,
    rh2m: float,
    ws10m: float,
    prectotcorr: float,
    solar: float,
    month: int,
    climate_regime: int,
    hill_station: int,
) -> dict:
    """Builds the full engineered feature row used by the neural network.

    The dict is later reindexed against model_service.nn_feature_order, so
    key names here must match the training column names exactly, but the
    order in which they're inserted here does not matter.
    """
    return {
        "LATITUDE": latitude,
        "LONGITUDE": longitude,
        "T2M": t2m,
        "RH2M": rh2m,
        "WS10M": ws10m,
        "PRECTOTCORR": prectotcorr,
        "ALLSKY_SFC_SW_DWN": solar,
        "MONTH": month,
        "CLIMATE_REGIME": climate_regime,
        "TEMP_HUMIDITY_INTERACTION": t2m * rh2m,
        "TEMP_WIND_INTERACTION": t2m * ws10m,
        "HUMIDITY_WIND_INTERACTION": rh2m * ws10m,
        "HEAT_HUMIDITY_INDEX": heat_humidity_index(t2m, rh2m),
        "HILL_STATION": hill_station,
    }


def run_full_pipeline(
    *,
    latitude: float,
    longitude: float,
    month: int,
    hill_station: int,
    weather: dict,
) -> dict:
    """
    weather -> CLIMATE_REGIME (climate scaler + kmeans) -> engineered features
    -> neural network -> (thermal_condition, confidence)

    Returns a dict with thermal_condition, confidence, climate_regime, and the
    raw weather values used, so callers can persist/return everything needed.
    """
    t2m = weather["T2M"]
    rh2m = weather["RH2M"]
    ws10m = weather["WS10M"]
    prectotcorr = weather["PRECTOTCORR"]
    solar = weather["ALLSKY_SFC_SW_DWN"]

    climate_regime = model_service.compute_climate_regime(
        {
            "T2M": t2m,
            "RH2M": rh2m,
            "WS10M": ws10m,
            "PRECTOTCORR": prectotcorr,
            "ALLSKY_SFC_SW_DWN": solar,
        }
    )

    feature_row = build_feature_row(
        latitude=latitude,
        longitude=longitude,
        t2m=t2m,
        rh2m=rh2m,
        ws10m=ws10m,
        prectotcorr=prectotcorr,
        solar=solar,
        month=month,
        climate_regime=climate_regime,
        hill_station=hill_station,
    )

    thermal_condition, confidence = model_service.predict(feature_row)

    return {
        "thermal_condition": thermal_condition,
        "confidence": confidence,
        "climate_regime": climate_regime,
        "weather": weather,
    }
