"""
일회성 스크립트: 기구명 일괄 변경
  어시스티드풀업머신 → 풀업머신
"""
from app.db import SessionLocal
from app.models.exercise import Exercise

db = SessionLocal()

exercises = db.query(Exercise).filter(
    Exercise.equipment.any("어시스티드풀업머신")  # type: ignore
).all()

print(f"대상 운동 {len(exercises)}개")

for ex in exercises:
    ex.equipment = [
        "풀업머신" if e == "어시스티드풀업머신" else e
        for e in (ex.equipment or [])
    ]
    print(f"  ✓ {ex.name}: {ex.equipment}")

db.commit()
db.close()
print("완료")
