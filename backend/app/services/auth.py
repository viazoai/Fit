from datetime import datetime, timedelta, timezone

import jwt
from passlib.hash import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.models.user import User

security = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.verify(password, password_hash)


def create_token(user_id: int) -> str:
    settings = get_settings()
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def get_current_user(
    cred: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """JWT에서 현재 사용자 추출"""
    settings = get_settings()
    try:
        payload = jwt.decode(cred.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="사용자를 찾을 수 없음")
    return user


def get_current_admin(user: User = Depends(get_current_user)) -> User:
    """관리자 권한 확인"""
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="관리자 권한이 필요합니다")
    return user


def seed_admin(db: Session) -> None:
    """admin 계정이 없으면 생성, 있으면 비밀번호 갱신"""
    settings = get_settings()
    if not settings.ADMIN_PASSWORD:
        return

    existing = db.query(User).filter(User.login_id == "zoai").first()
    if existing:
        # 비밀번호 갱신 + admin/승인 플래그 보장
        existing.password_hash = hash_password(settings.ADMIN_PASSWORD)
        existing.is_admin = True
        existing.is_approved = True
        db.commit()
        return

    admin = User(
        name="형준",
        login_id="zoai",
        password_hash=hash_password(settings.ADMIN_PASSWORD),
        is_admin=True,
        is_approved=True,
    )
    db.add(admin)
    db.commit()
