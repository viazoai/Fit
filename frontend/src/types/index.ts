export type BodyPart =
  | "chest"
  | "back"
  | "shoulder"
  | "legs"
  | "arms"
  | "core"
  | "cardio"

export type ExerciseType = "strength" | "cardio" | "stretching"
export type Difficulty = "beginner" | "intermediate" | "advanced"

export interface Exercise {
  id: string
  nameKo: string
  nameEn: string
  bodyPart: BodyPart
  primaryMuscle: string
  secondaryMuscle?: string
  exerciseType: ExerciseType
  difficulty: Difficulty
  equipment: string
  youtubeUrl?: string
  youtubeStartSec?: number
  description?: string
  metValue?: number
}

export interface WorkoutSet {
  id: string
  exerciseId: string
  setNumber: number
  weightKg: number
  reps: number
  restSec?: number
  rpe?: number
}

export interface WorkoutSession {
  id: string
  userId: string
  date: string
  overallRpe?: number
  memo?: string
  caloriesBurned?: number
  startedAt?: string
  finishedAt?: string
  sets: WorkoutSet[]
}

export interface ActiveSet {
  exerciseId: string
  setNumber: number
  weightKg: number
  reps: number
  rpe: number
}

export interface ActiveExercise {
  exerciseId: string
  sets: ActiveSet[]
}

export interface User {
  id: string
  nickname: string
  weightKg?: number
  heightCm?: number
  age?: number
  gender?: "male" | "female"
  muscleMassKg?: number
  bodyFatPct?: number
  fitnessGoal?: string
  equipment?: string[]
  injuries?: string
}

export interface ShopItem {
  id: string
  name: string
  description?: string
  price: number
  isCustom: boolean
}

export interface UserCoupon {
  id: string
  userId: string
  itemId: string
  itemName: string
  price: number
  purchasedAt: string
  status: "unused" | "used" | "refunded"
  usedAt?: string
}

export interface PointLedgerEntry {
  id: string
  userId: string
  amount: number
  reason: string
  balance: number
  date: string
  createdAt: string
}
