import type { User } from "@/types"

export const mockUsers: User[] = [
  {
    id: "user-1",
    nickname: "민준",
    gender: "male",
    age: 32,
    weightKg: 78,
    heightCm: 178,
    fitnessGoal: "근력 향상",
    equipment: ["barbell", "dumbbell", "cable"],
  },
  {
    id: "user-2",
    nickname: "지은",
    gender: "female",
    age: 30,
    weightKg: 55,
    heightCm: 163,
    fitnessGoal: "체지방 감소",
    equipment: ["dumbbell", "machine"],
  },
]
