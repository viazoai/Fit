from pydantic import BaseModel
from datetime import datetime


class UserRead(BaseModel):
    id: int
    name: str
    theme: str = "dark"
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: str | None = None
    theme: str | None = None


class LoginRequest(BaseModel):
    name: str
    pin: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
