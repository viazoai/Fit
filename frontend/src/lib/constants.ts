import type { BodyPart } from "@/types"

export const BODY_PART_KO: Record<BodyPart, string> = {
  chest: "가슴",
  back: "등",
  shoulder: "어깨",
  legs: "하체",
  arms: "팔",
  core: "코어",
  cardio: "유산소",
}

export const DIFFICULTY_KO: Record<string, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
}

export const DIFFICULTY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  beginner: "secondary",
  intermediate: "default",
  advanced: "outline",
}

export const EQUIPMENT_KO: Record<string, string> = {
  barbell: "바벨",
  dumbbell: "덤벨",
  cable: "케이블",
  machine: "머신",
  bodyweight: "맨몸",
  "pull-up bar": "철봉",
}

export const EQUIPMENT_TYPES = Object.keys(EQUIPMENT_KO) as string[]

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"]

export const WEEK_GOAL = 4

export const BODY_PARTS: BodyPart[] = [
  "chest",
  "back",
  "shoulder",
  "legs",
  "arms",
  "core",
  "cardio",
]
