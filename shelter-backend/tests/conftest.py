import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_shelter.db")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.services.model import model_service

TEST_DB_URL = "sqlite:///./test_shelter.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def _setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("test_shelter.db"):
        os.remove("test_shelter.db")


@pytest.fixture(scope="session", autouse=True)
def _load_model():
    if not model_service.is_loaded:
        model_service.load()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def mock_nasa_power(monkeypatch):
    """Mocks the NASA POWER climatology fetch so tests never hit the real API."""

    async def _fake_fetch(latitude, longitude):
        return {
            "T2M": {m: 25.0 for m in [
                "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
            ]},
            "RH2M": {m: 55.0 for m in [
                "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
            ]},
            "WS10M": {m: 3.0 for m in [
                "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
            ]},
            "PRECTOTCORR": {m: 2.0 for m in [
                "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
            ]},
            "ALLSKY_SFC_SW_DWN": {m: 18.0 for m in [
                "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
            ]},
        }

    import app.services.weather as weather_module

    monkeypatch.setattr(weather_module, "_fetch_climatology", _fake_fetch)
    weather_module.weather_cache._store.clear()
    yield


def register_and_login(client, email="user@example.com", password="Password123"):
    client.post("/api/v1/auth/register", json={"email": email, "password": password, "name": "Test User"})
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = resp.json()["data"]["access_token"]
    return token
