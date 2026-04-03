// ─── Backend-aligned types ───────────────────────────────────────────────────

export type ExerciseType = "기구" | "맨몸" | "유산소" | "스트레칭"

export type MuscleGroup =
  | "가슴"
  | "등"
  | "어깨"
  | "하체"
  | "코어"
  | "이두"
  | "삼두"
  | "전신"
  | "없음"

export type Difficulty = "초급" | "중급" | "고급"

export interface Exercise {
  id: number
  name: string
  type: ExerciseType
  muscle_group: MuscleGroup | null
  difficulty: Difficulty | null
  equipment: string[] | null
  youtube_url: string | null
  met_value: number | null
  is_active: boolean
  created_at: string
}

// ─── Workout (3-tier: session → exercise_log → set) ─────────────────────────

export interface ExerciseSetRead {
  id: number
  set_index: number
  reps: number | null
  weight_kg: number | null
  is_assisted: boolean
  assist_weight_kg: number | null
  memo: string | null
}

export interface ExerciseLogRead {
  id: number
  exercise_id: number
  order_index: number | null
  duration_min: number | null
  distance_km: number | null
  speed_kmh: number | null
  incline_pct: number | null
  environment: "outdoor" | "treadmill" | "machine" | "cycling" | null
  memo: string | null
  sets: ExerciseSetRead[]
  exercise_name: string | null
  exercise_type: string | null
  muscle_group: string | null
}

export interface WorkoutSessionSummary {
  id: number
  user_id: number
  date: string
  memo: string | null
  kcal: number | null
  duration_min: number | null
  exercise_count: number
  muscle_groups: string[]
}

export interface WorkoutSessionRead {
  id: number
  user_id: number
  date: string
  memo: string | null
  kcal: number | null
  duration_min: number | null
  created_at: string
  exercise_logs: ExerciseLogRead[]
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export interface CalendarDay {
  date: string
  user_ids: number[]
  session_count: number
}

export interface CalendarResponse {
  year: number
  month: number
  days: CalendarDay[]
}

// ─── User ────────────────────────────────────────────────────────────────────

export type ThemeMode = "system" | "light" | "dark"

export interface UserRead {
  id: number
  name: string
  theme: ThemeMode
  created_at: string
}

// ─── Active workout (local UI state for logging) ─────────────────────────────

export interface ActiveSet {
  exerciseId: number
  setNumber: number
  weightKg: number
  reps: number
  rpe: number
}

export interface ActiveExercise {
  exerciseId: number
  sets: ActiveSet[]
  // 유산소/스트레칭용
  durationMin?: number
  distanceKm?: number
  speedKmh?: number
  inclinePct?: number
}

// ─── Gamification (local-only, no backend yet) ───────────────────────────────

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
