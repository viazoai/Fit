from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import SessionLocal
from app.routers import auth, exercises, workouts, calendar, users
from app.services.auth import seed_admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup: admin 시딩
    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Fit API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["인증"])
app.include_router(exercises.router, prefix="/api/exercises", tags=["운동 종목"])
app.include_router(workouts.router, prefix="/api/workouts", tags=["운동 기록"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["캘린더"])
app.include_router(users.router, prefix="/api/users", tags=["사용자"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
