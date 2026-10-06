from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    name: str | None
    profile_picture: str | None
    provider: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    """Only safe, user-editable profile fields."""

    name: str | None = Field(default=None, max_length=255)
    profile_picture: str | None = Field(default=None, max_length=1024)
