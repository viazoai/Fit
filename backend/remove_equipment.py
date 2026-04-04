"""
일회성 스크립트: 기구명 제거
  자전거, 스텝밀 → equipment 배열에서 삭제
"""
from app.db import SessionLocal
from app.models.exercise import Exercise

REMOVE = {"자전거", "스텝밀"}

db = SessionLocal()

exercises = db.query(Exercise).all()
updated = 0

for ex in exercises:
    if not ex.equipment:
        continue
    new_eq = [e for e in ex.equipment if e not in REMOVE]
    if new_eq != ex.equipment:
        ex.equipment = new_eq if new_eq else None
        print(f"  ✓ {ex.name}: {ex.equipment}")
        updated += 1

db.commit()
db.close()
print(f"완료 ({updated}개 운동 업데이트)")
