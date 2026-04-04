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

/** 기구 목록 (필터 & 프로필 보유장비 공용) */
export const EQUIPMENT_LIST = [
  "바벨",
  "덤벨",
  "벤치",
  "케이블머신",
  "스미스머신",
  "체스트프레스머신",
  "랫풀다운머신",
  "레그프레스머신",
  "레그컬머신",
  "레그익스텐션머신",
  "펙덱머신",
  "로잉머신",
  "철봉",
  "딥스바",
  "저항밴드",
  "케틀벨",
  "트레드밀",
  "풀업머신",
] as const

export type EquipmentName = (typeof EQUIPMENT_LIST)[number]

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"]

export const WEEK_GOAL = 4
