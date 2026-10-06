from tests.conftest import register_and_login


def test_predict_requires_auth(client, mock_nasa_power):
    resp = client.post(
        "/api/v1/predictions/predict",
        json={"latitude": 27.88, "longitude": 79.91, "month": 6, "hill_station": 0},
    )
    assert resp.status_code == 401


def test_recommend_requires_auth(client, mock_nasa_power):
    resp = client.post(
        "/api/v1/predictions/recommend",
        json={"latitude": 27.88, "longitude": 79.91, "month": 6, "hill_station": 0},
    )
    assert resp.status_code == 401


def test_predict_success(client, mock_nasa_power):
    token = register_and_login(client, email="predict-user@example.com")
    resp = client.post(
        "/api/v1/predictions/predict",
        json={"latitude": 27.88, "longitude": 79.91, "month": 6, "hill_station": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["thermal_condition"] in [
        "Cold", "Hot-Humid", "Hot-Dry", "High-Solar", "Windy", "Moderate",
    ]
    assert 0 <= data["confidence"] <= 100


def test_recommend_and_history(client, mock_nasa_power):
    token = register_and_login(client, email="recommend-user@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/v1/predictions/recommend",
        json={"latitude": 27.88, "longitude": 79.91, "month": 6, "hill_station": 0},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "design" in data
    assert set(data["design"].keys()) == {"roof", "walls", "ventilation", "shading", "priority"}

    resp = client.get("/api/v1/predictions/history", headers=headers)
    assert resp.status_code == 200
    history = resp.json()["data"]
    assert history["total"] >= 1
    assert history["items"][0]["thermal_condition"] == data["thermal_condition"]


def test_invalid_month(client, mock_nasa_power):
    token = register_and_login(client, email="badmonth@example.com")
    resp = client.post(
        "/api/v1/predictions/predict",
        json={"latitude": 27.88, "longitude": 79.91, "month": 13, "hill_station": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_invalid_latitude(client, mock_nasa_power):
    token = register_and_login(client, email="badlat@example.com")
    resp = client.post(
        "/api/v1/predictions/predict",
        json={"latitude": 200, "longitude": 79.91, "month": 6, "hill_station": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_invalid_longitude(client, mock_nasa_power):
    token = register_and_login(client, email="badlon@example.com")
    resp = client.post(
        "/api/v1/predictions/predict",
        json={"latitude": 27.88, "longitude": 400, "month": 6, "hill_station": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422


def test_history_belongs_to_correct_user_and_isolation(client, mock_nasa_power):
    token_a = register_and_login(client, email="user-a@example.com")
    token_b = register_and_login(client, email="user-b@example.com")

    resp = client.post(
        "/api/v1/predictions/recommend",
        json={"latitude": 27.88, "longitude": 79.91, "month": 6, "hill_station": 0},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    prediction_id = resp.json()["data"]

    resp = client.get(
        "/api/v1/predictions/history",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    item_id = resp.json()["data"]["items"][0]["id"]

    # User B must not be able to read User A's history record.
    resp = client.get(
        f"/api/v1/predictions/history/{item_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp.status_code == 404

    # User A can read their own record.
    resp = client.get(
        f"/api/v1/predictions/history/{item_id}",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert resp.status_code == 200


def test_weather_cache_reused_across_months(client, mock_nasa_power, monkeypatch):
    import app.services.weather as weather_module

    call_count = {"n": 0}
    original = weather_module._fetch_climatology

    async def counting_fetch(latitude, longitude):
        call_count["n"] += 1
        return await original(latitude, longitude)

    monkeypatch.setattr(weather_module, "_fetch_climatology", counting_fetch)
    weather_module.weather_cache._store.clear()

    token = register_and_login(client, email="cache-user@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    client.post(
        "/api/v1/predictions/predict",
        json={"latitude": 10.0, "longitude": 10.0, "month": 1, "hill_station": 0},
        headers=headers,
    )
    client.post(
        "/api/v1/predictions/predict",
        json={"latitude": 10.0, "longitude": 10.0, "month": 6, "hill_station": 0},
        headers=headers,
    )

    assert call_count["n"] == 1
