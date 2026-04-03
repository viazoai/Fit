from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, exercises, workouts, calendar, users

app = FastAPI(title="Fit API", version="0.1.0")

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
