from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.schemas.user import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserRead,
    PendingUserRead,
)
from app.services.auth import verify_password, create_token, hash_password, get_current_admin

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.login_id == body.login_id).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="아이디 또는 비밀번호가 올바르지 않습니다")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="아이디 또는 비밀번호가 올바르지 않습니다")
    if not user.is_approved:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="아직 승인되지 않은 계정입니다. 관리자의 승인을 기다려주세요.")

    token = create_token(user.id)
    return TokenResponse(access_token=token, user=UserRead.model_validate(user))


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.login_id == body.login_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 존재하는 아이디입니다")

    user = User(
        name=body.name,
        login_id=body.login_id,
        password_hash=hash_password(body.password),
        is_approved=False,
    )
    db.add(user)
    db.commit()
    return {"ok": True}


@router.get("/pending-users", response_model=list[PendingUserRead])
def get_pending_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    return db.query(User).filter(User.is_approved == False).all()  # noqa: E712


@router.post("/users/{user_id}/approve")
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없음")
    user.is_approved = True
    db.commit()
    return {"ok": True}


@router.delete("/users/{user_id}")
def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없음")
    db.delete(user)
    db.commit()
    return {"ok": True}
