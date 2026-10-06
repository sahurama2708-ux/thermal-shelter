"""
NASA POWER climatology client + weather cache.

Cache key is (lat rounded to 2dp, lon rounded to 2dp) and stores the FULL
12-month climatology response, so switching months for the same coordinate
never triggers another NASA request.

For local dev this is a simple in-memory TTL cache. The interface
(`WeatherCache.get` / `.set`) is intentionally minimal so it can be swapped
for a Redis-backed implementation in production without touching callers.
"""
import logging
import time
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger("shelter.weather")

PARAMETERS = ["T2M", "RH2M", "WS10M", "PRECTOTCORR", "ALLSKY_SFC_SW_DWN"]

MONTH_CODES = {
    1: "JAN", 2: "FEB", 3: "MAR", 4: "APR", 5: "MAY", 6: "JUN",
    7: "JUL", 8: "AUG", 9: "SEP", 10: "OCT", 11: "NOV", 12: "DEC",
}


class WeatherServiceError(Exception):
    """Raised when NASA POWER is unavailable, times out, or returns malformed data."""


class WeatherCache:
    """In-memory TTL cache. Structured so a Redis client could satisfy the
    same get/set interface in production."""

    def __init__(self, ttl_seconds: int) -> None:
        self._ttl = ttl_seconds
        self._store: dict[str, tuple[float, dict]] = {}

    @staticmethod
    def make_key(latitude: float, longitude: float) -> str:
        return f"{round(latitude, 2)}:{round(longitude, 2)}"

    def get(self, key: str) -> Optional[dict]:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.time() > expires_at:
            self._store.pop(key, None)
            return None
        return value

    def set(self, key: str, value: dict) -> None:
        self._store[key] = (time.time() + self._ttl, value)


_settings = get_settings()
weather_cache = WeatherCache(ttl_seconds=_settings.WEATHER_CACHE_TTL_SECONDS)


async def _fetch_climatology(latitude: float, longitude: float) -> dict:
    settings = get_settings()
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "parameters": ",".join(PARAMETERS),
        "community": "RE",
        "format": "JSON",
    }

    try:
        async with httpx.AsyncClient(timeout=settings.NASA_POWER_TIMEOUT_SECONDS) as client:
            response = await client.get(settings.NASA_POWER_URL, params=params)
    except httpx.TimeoutException as exc:
        raise WeatherServiceError("NASA POWER request timed out") from exc
    except httpx.HTTPError as exc:
        raise WeatherServiceError(f"NASA POWER request failed: {exc}") from exc

    if response.status_code != 200:
        raise WeatherServiceError(
            f"NASA POWER returned HTTP {response.status_code}"
        )

    try:
        payload = response.json()
        monthly = payload["properties"]["parameter"]
    except (ValueError, KeyError, TypeError) as exc:
        raise WeatherServiceError("Malformed NASA POWER response") from exc

    for param in PARAMETERS:
        if param not in monthly:
            raise WeatherServiceError(f"NASA POWER response missing parameter {param}")

    return monthly


async def get_monthly_climatology(latitude: float, longitude: float) -> dict:
    """Returns the full 12-month climatology for a coordinate, using the cache
    when available."""
    key = weather_cache.make_key(latitude, longitude)
    cached = weather_cache.get(key)
    if cached is not None:
        return cached

    monthly = await _fetch_climatology(latitude, longitude)
    weather_cache.set(key, monthly)
    return monthly


async def get_weather_for_month(latitude: float, longitude: float, month: int) -> dict:
    """Selects the requested month's values from the (possibly cached)
    12-month climatology."""
    monthly = await get_monthly_climatology(latitude, longitude)
    month_code = MONTH_CODES[month]

    result = {}
    for param in PARAMETERS:
        try:
            result[param] = float(monthly[param][month_code])
        except (KeyError, TypeError, ValueError) as exc:
            raise WeatherServiceError(
                f"NASA POWER response missing value for {param}/{month_code}"
            ) from exc

    return result
