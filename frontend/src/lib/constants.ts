import type { MuscleGroup } from "@/types"

/**
 * muscle_group 한글 값 목록 (필터 탭용)
 * 백엔드가 이미 한글이므로 매핑 불필요하지만, 필터 UI에서 순서 지정용으로 유지
 */
export const MUSCLE_GROUPS: MuscleGroup[] = [
  "가슴",
  "등",
  "어깨",
  "하체",
  "코어",
  "이두",
  "삼두",
  "전신",
]

export const DIFFICULTY_KO: Record<string, string> = {
  초급: "초급",
  중급: "중급",
  고급: "고급",
}

export const DIFFICULTY_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  초급: "secondary",
  중급: "default",
  고급: "outline",
}

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"]

export const WEEK_GOAL = 4
