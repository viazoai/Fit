from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserRead)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserRead)
def update_me(body: UserUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if body.name is not None:
        user.name = body.name
    if body.theme is not None:
        if body.theme not in ("system", "light", "dark"):
            from fastapi import HTTPException
            raise HTTPException(status_code=422, detail="theme must be system, light, or dark")
        user.theme = body.theme
    db.commit()
    db.refresh(user)
    return user
