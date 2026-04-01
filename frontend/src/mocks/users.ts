import type { User } from "@/types"

export const mockUsers: User[] = [
  {
    id: "user-1",
    nickname: "형준",
    gender: "male",
    age: 32,
    weightKg: 78,
    heightCm: 178,
    muscleMassKg: 35.2,
    bodyFatPct: 18.5,
    fitnessGoal: "근력 향상",
    equipment: ["barbell", "dumbbell", "cable"],
  },
  {
    id: "user-2",
    nickname: "윤희",
    gender: "female",
    age: 30,
    weightKg: 55,
    heightCm: 163,
    muscleMassKg: 22.1,
    bodyFatPct: 24.3,
    fitnessGoal: "체지방 감소",
    equipment: ["dumbbell", "machine"],
  },
]
