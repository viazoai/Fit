from pydantic import BaseModel
from datetime import datetime


class UserRead(BaseModel):
    id: int
    name: str
    login_id: str
    is_admin: bool = False
    is_approved: bool = False
    theme: str = "dark"
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: str | None = None
    theme: str | None = None


class LoginRequest(BaseModel):
    login_id: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    login_id: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class PendingUserRead(BaseModel):
    id: int
    name: str
    login_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
