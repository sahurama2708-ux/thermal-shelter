from typing import Any

from fastapi.encoders import jsonable_encoder


def success(data: Any) -> dict:
    return {"success": True, "data": jsonable_encoder(data)}


def error(code: str, message: str) -> dict:
    return {"success": False, "error": {"code": code, "message": message}}
