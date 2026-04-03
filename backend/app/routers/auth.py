from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.schemas.user import LoginRequest, TokenResponse, UserRead
from app.services.auth import verify_pin, create_token, hash_pin

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.name == body.name).first()
    if not user or not user.pin_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="사용자 또는 PIN 불일치")
    if not verify_pin(body.pin, user.pin_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="사용자 또는 PIN 불일치")

    token = create_token(user.id)
    return TokenResponse(access_token=token, user=UserRead.model_validate(user))


@router.post("/setup", response_model=UserRead)
def setup_user(body: LoginRequest, db: Session = Depends(get_db)):
    """초기 사용자 생성 (최대 2명)"""
    count = db.query(User).count()
    if count >= 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="최대 2명까지만 등록 가능")

    existing = db.query(User).filter(User.name == body.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 존재하는 이름")

    user = User(name=body.name, pin_hash=hash_pin(body.pin))
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserRead.model_validate(user)
