def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True
    assert body["database"] == "ok"


def test_model_artifacts_loaded():
    from app.services.model import model_service

    assert model_service.is_loaded
    assert model_service.model is not None
    assert model_service.nn_feature_order == [
        "LATITUDE", "LONGITUDE", "T2M", "RH2M", "WS10M", "PRECTOTCORR",
        "ALLSKY_SFC_SW_DWN", "MONTH", "CLIMATE_REGIME",
        "TEMP_HUMIDITY_INTERACTION", "TEMP_WIND_INTERACTION",
        "HUMIDITY_WIND_INTERACTION", "HEAT_HUMIDITY_INDEX", "HILL_STATION",
    ]
