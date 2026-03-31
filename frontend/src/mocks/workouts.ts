import type { WorkoutSession } from "@/types"

// 기준일: 2026-03-31 (오늘)
// 이번 주: 2026-03-30(월) ~ 2026-03-31(화) 기준
// 실제 날짜 계산:
// 2026-03-31 = 화요일 (기준일)
// 이번 주 월요일 = 2026-03-30
// 이번 주 수요일 = 2026-04-01
// 이번 주 금요일 = 2026-04-03
// 지난 주 월 = 2026-03-23, 화 = 2026-03-24, 수 = 2026-03-25, 목 = 2026-03-26, 금 = 2026-03-27

export const mockWorkouts: WorkoutSession[] = [
  // ─────────────────────────────────────────
  // user-1 (민준): 이번 주 3회 (월/수/금)
  // ─────────────────────────────────────────
  {
    id: "session-001",
    userId: "user-1",
    date: "2026-03-30",
    startedAt: "2026-03-30T07:00:00",
    finishedAt: "2026-03-30T08:10:00",
    overallRpe: 7,
    caloriesBurned: 420,
    memo: "가슴/삼두 운동. 벤치프레스 중량 +2.5kg 성공",
    sets: [
      // 벤치프레스 3세트
      { id: "set-001", exerciseId: "ex-001", setNumber: 1, weightKg: 80, reps: 8, restSec: 120, rpe: 7 },
      { id: "set-002", exerciseId: "ex-001", setNumber: 2, weightKg: 80, reps: 7, restSec: 120, rpe: 8 },
      { id: "set-003", exerciseId: "ex-001", setNumber: 3, weightKg: 80, reps: 6, restSec: 120, rpe: 9 },
      // 인클라인 벤치프레스 3세트
      { id: "set-004", exerciseId: "ex-002", setNumber: 1, weightKg: 60, reps: 10, restSec: 90, rpe: 6 },
      { id: "set-005", exerciseId: "ex-002", setNumber: 2, weightKg: 60, reps: 9, restSec: 90, rpe: 7 },
      { id: "set-006", exerciseId: "ex-002", setNumber: 3, weightKg: 60, reps: 8, restSec: 90, rpe: 8 },
      // 트라이셉스 푸쉬다운 3세트
      { id: "set-007", exerciseId: "ex-020", setNumber: 1, weightKg: 30, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-008", exerciseId: "ex-020", setNumber: 2, weightKg: 30, reps: 12, restSec: 60, rpe: 7 },
      { id: "set-009", exerciseId: "ex-020", setNumber: 3, weightKg: 30, reps: 10, restSec: 60, rpe: 8 },
    ],
  },
  {
    id: "session-002",
    userId: "user-1",
    date: "2026-04-01",
    startedAt: "2026-04-01T07:00:00",
    finishedAt: "2026-04-01T08:20:00",
    overallRpe: 8,
    caloriesBurned: 480,
    memo: "등/이두 데이. 데드리프트 컨디션 좋음",
    sets: [
      // 데드리프트 3세트
      { id: "set-010", exerciseId: "ex-010", setNumber: 1, weightKg: 120, reps: 5, restSec: 180, rpe: 7 },
      { id: "set-011", exerciseId: "ex-010", setNumber: 2, weightKg: 120, reps: 5, restSec: 180, rpe: 8 },
      { id: "set-012", exerciseId: "ex-010", setNumber: 3, weightKg: 120, reps: 4, restSec: 180, rpe: 9 },
      // 랫풀다운 3세트
      { id: "set-013", exerciseId: "ex-007", setNumber: 1, weightKg: 65, reps: 10, restSec: 90, rpe: 6 },
      { id: "set-014", exerciseId: "ex-007", setNumber: 2, weightKg: 65, reps: 10, restSec: 90, rpe: 7 },
      { id: "set-015", exerciseId: "ex-007", setNumber: 3, weightKg: 65, reps: 8, restSec: 90, rpe: 8 },
      // 바벨 컬 3세트
      { id: "set-016", exerciseId: "ex-019", setNumber: 1, weightKg: 35, reps: 10, restSec: 60, rpe: 6 },
      { id: "set-017", exerciseId: "ex-019", setNumber: 2, weightKg: 35, reps: 10, restSec: 60, rpe: 7 },
      { id: "set-018", exerciseId: "ex-019", setNumber: 3, weightKg: 35, reps: 8, restSec: 60, rpe: 8 },
    ],
  },
  {
    id: "session-003",
    userId: "user-1",
    date: "2026-04-03",
    startedAt: "2026-04-03T07:00:00",
    finishedAt: "2026-04-03T08:15:00",
    overallRpe: 7,
    caloriesBurned: 450,
    sets: [
      // 스쿼트 3세트
      { id: "set-019", exerciseId: "ex-014", setNumber: 1, weightKg: 100, reps: 6, restSec: 150, rpe: 7 },
      { id: "set-020", exerciseId: "ex-014", setNumber: 2, weightKg: 100, reps: 6, restSec: 150, rpe: 8 },
      { id: "set-021", exerciseId: "ex-014", setNumber: 3, weightKg: 100, reps: 5, restSec: 150, rpe: 9 },
      // 레그 프레스 3세트
      { id: "set-022", exerciseId: "ex-015", setNumber: 1, weightKg: 150, reps: 10, restSec: 90, rpe: 6 },
      { id: "set-023", exerciseId: "ex-015", setNumber: 2, weightKg: 150, reps: 10, restSec: 90, rpe: 7 },
      { id: "set-024", exerciseId: "ex-015", setNumber: 3, weightKg: 150, reps: 8, restSec: 90, rpe: 8 },
      // 루마니안 데드리프트 3세트
      { id: "set-025", exerciseId: "ex-018", setNumber: 1, weightKg: 80, reps: 10, restSec: 90, rpe: 6 },
      { id: "set-026", exerciseId: "ex-018", setNumber: 2, weightKg: 80, reps: 10, restSec: 90, rpe: 7 },
      { id: "set-027", exerciseId: "ex-018", setNumber: 3, weightKg: 80, reps: 9, restSec: 90, rpe: 7 },
    ],
  },
  // ─────────────────────────────────────────
  // user-1 (민준): 지난 주 4회 (월/화/목/금)
  // ─────────────────────────────────────────
  {
    id: "session-004",
    userId: "user-1",
    date: "2026-03-23",
    startedAt: "2026-03-23T07:00:00",
    finishedAt: "2026-03-23T08:00:00",
    overallRpe: 6,
    caloriesBurned: 380,
    sets: [
      { id: "set-028", exerciseId: "ex-001", setNumber: 1, weightKg: 77.5, reps: 8, restSec: 120, rpe: 6 },
      { id: "set-029", exerciseId: "ex-001", setNumber: 2, weightKg: 77.5, reps: 8, restSec: 120, rpe: 7 },
      { id: "set-030", exerciseId: "ex-001", setNumber: 3, weightKg: 77.5, reps: 7, restSec: 120, rpe: 8 },
      { id: "set-031", exerciseId: "ex-005", setNumber: 1, weightKg: 16, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-032", exerciseId: "ex-005", setNumber: 2, weightKg: 16, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-033", exerciseId: "ex-005", setNumber: 3, weightKg: 16, reps: 10, restSec: 60, rpe: 7 },
      { id: "set-034", exerciseId: "ex-004", setNumber: 1, weightKg: 0, reps: 10, restSec: 90, rpe: 7 },
      { id: "set-035", exerciseId: "ex-004", setNumber: 2, weightKg: 0, reps: 9, restSec: 90, rpe: 8 },
      { id: "set-036", exerciseId: "ex-004", setNumber: 3, weightKg: 0, reps: 8, restSec: 90, rpe: 9 },
    ],
  },
  {
    id: "session-005",
    userId: "user-1",
    date: "2026-03-24",
    startedAt: "2026-03-24T07:00:00",
    finishedAt: "2026-03-24T08:05:00",
    overallRpe: 7,
    caloriesBurned: 400,
    sets: [
      { id: "set-037", exerciseId: "ex-006", setNumber: 1, weightKg: 0, reps: 8, restSec: 120, rpe: 7 },
      { id: "set-038", exerciseId: "ex-006", setNumber: 2, weightKg: 0, reps: 7, restSec: 120, rpe: 8 },
      { id: "set-039", exerciseId: "ex-006", setNumber: 3, weightKg: 0, reps: 6, restSec: 120, rpe: 9 },
      { id: "set-040", exerciseId: "ex-008", setNumber: 1, weightKg: 70, reps: 8, restSec: 90, rpe: 7 },
      { id: "set-041", exerciseId: "ex-008", setNumber: 2, weightKg: 70, reps: 8, restSec: 90, rpe: 7 },
      { id: "set-042", exerciseId: "ex-008", setNumber: 3, weightKg: 70, reps: 7, restSec: 90, rpe: 8 },
      { id: "set-043", exerciseId: "ex-009", setNumber: 1, weightKg: 55, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-044", exerciseId: "ex-009", setNumber: 2, weightKg: 55, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-045", exerciseId: "ex-009", setNumber: 3, weightKg: 55, reps: 10, restSec: 60, rpe: 7 },
    ],
  },
  {
    id: "session-006",
    userId: "user-1",
    date: "2026-03-26",
    startedAt: "2026-03-26T18:00:00",
    finishedAt: "2026-03-26T19:10:00",
    overallRpe: 8,
    caloriesBurned: 460,
    sets: [
      { id: "set-046", exerciseId: "ex-011", setNumber: 1, weightKg: 60, reps: 6, restSec: 120, rpe: 8 },
      { id: "set-047", exerciseId: "ex-011", setNumber: 2, weightKg: 60, reps: 5, restSec: 120, rpe: 9 },
      { id: "set-048", exerciseId: "ex-011", setNumber: 3, weightKg: 57.5, reps: 6, restSec: 120, rpe: 8 },
      { id: "set-049", exerciseId: "ex-012", setNumber: 1, weightKg: 14, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-050", exerciseId: "ex-012", setNumber: 2, weightKg: 14, reps: 12, restSec: 60, rpe: 7 },
      { id: "set-051", exerciseId: "ex-012", setNumber: 3, weightKg: 14, reps: 10, restSec: 60, rpe: 7 },
      { id: "set-052", exerciseId: "ex-013", setNumber: 1, weightKg: 12, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-053", exerciseId: "ex-013", setNumber: 2, weightKg: 12, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-054", exerciseId: "ex-013", setNumber: 3, weightKg: 12, reps: 10, restSec: 60, rpe: 7 },
    ],
  },
  {
    id: "session-007",
    userId: "user-1",
    date: "2026-03-27",
    startedAt: "2026-03-27T07:00:00",
    finishedAt: "2026-03-27T08:00:00",
    overallRpe: 7,
    caloriesBurned: 430,
    sets: [
      { id: "set-055", exerciseId: "ex-014", setNumber: 1, weightKg: 95, reps: 6, restSec: 150, rpe: 7 },
      { id: "set-056", exerciseId: "ex-014", setNumber: 2, weightKg: 95, reps: 6, restSec: 150, rpe: 7 },
      { id: "set-057", exerciseId: "ex-014", setNumber: 3, weightKg: 95, reps: 5, restSec: 150, rpe: 8 },
      { id: "set-058", exerciseId: "ex-016", setNumber: 1, weightKg: 18, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-059", exerciseId: "ex-016", setNumber: 2, weightKg: 18, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-060", exerciseId: "ex-016", setNumber: 3, weightKg: 18, reps: 10, restSec: 60, rpe: 7 },
      { id: "set-061", exerciseId: "ex-017", setNumber: 1, weightKg: 45, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-062", exerciseId: "ex-017", setNumber: 2, weightKg: 45, reps: 12, restSec: 60, rpe: 7 },
      { id: "set-063", exerciseId: "ex-017", setNumber: 3, weightKg: 45, reps: 10, restSec: 60, rpe: 7 },
    ],
  },
  // ─────────────────────────────────────────
  // user-2 (지은): 이번 주 2회 (화/목)
  // ─────────────────────────────────────────
  {
    id: "session-008",
    userId: "user-2",
    date: "2026-03-31",
    startedAt: "2026-03-31T10:00:00",
    finishedAt: "2026-03-31T10:55:00",
    overallRpe: 6,
    caloriesBurned: 280,
    memo: "전신 운동. 가볍게 시작",
    sets: [
      // 덤벨 플라이 3세트
      { id: "set-064", exerciseId: "ex-005", setNumber: 1, weightKg: 8, reps: 12, restSec: 60, rpe: 5 },
      { id: "set-065", exerciseId: "ex-005", setNumber: 2, weightKg: 8, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-066", exerciseId: "ex-005", setNumber: 3, weightKg: 8, reps: 10, restSec: 60, rpe: 7 },
      // 랫풀다운 3세트
      { id: "set-067", exerciseId: "ex-007", setNumber: 1, weightKg: 35, reps: 12, restSec: 60, rpe: 5 },
      { id: "set-068", exerciseId: "ex-007", setNumber: 2, weightKg: 35, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-069", exerciseId: "ex-007", setNumber: 3, weightKg: 35, reps: 10, restSec: 60, rpe: 7 },
      // 레그 프레스 3세트
      { id: "set-070", exerciseId: "ex-015", setNumber: 1, weightKg: 60, reps: 12, restSec: 60, rpe: 5 },
      { id: "set-071", exerciseId: "ex-015", setNumber: 2, weightKg: 60, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-072", exerciseId: "ex-015", setNumber: 3, weightKg: 60, reps: 10, restSec: 60, rpe: 7 },
    ],
  },
  {
    id: "session-009",
    userId: "user-2",
    date: "2026-04-02",
    startedAt: "2026-04-02T10:00:00",
    finishedAt: "2026-04-02T11:00:00",
    overallRpe: 7,
    caloriesBurned: 310,
    sets: [
      // 덤벨 레터럴 레이즈 3세트
      { id: "set-073", exerciseId: "ex-012", setNumber: 1, weightKg: 6, reps: 15, restSec: 45, rpe: 6 },
      { id: "set-074", exerciseId: "ex-012", setNumber: 2, weightKg: 6, reps: 15, restSec: 45, rpe: 6 },
      { id: "set-075", exerciseId: "ex-012", setNumber: 3, weightKg: 6, reps: 12, restSec: 45, rpe: 7 },
      // 시티드 케이블 로우 3세트
      { id: "set-076", exerciseId: "ex-009", setNumber: 1, weightKg: 30, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-077", exerciseId: "ex-009", setNumber: 2, weightKg: 30, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-078", exerciseId: "ex-009", setNumber: 3, weightKg: 30, reps: 10, restSec: 60, rpe: 7 },
      // 런지 3세트
      { id: "set-079", exerciseId: "ex-016", setNumber: 1, weightKg: 10, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-080", exerciseId: "ex-016", setNumber: 2, weightKg: 10, reps: 12, restSec: 60, rpe: 7 },
      { id: "set-081", exerciseId: "ex-016", setNumber: 3, weightKg: 10, reps: 10, restSec: 60, rpe: 7 },
    ],
  },
  // ─────────────────────────────────────────
  // user-2 (지은): 지난 주 3회 (월/수/금)
  // ─────────────────────────────────────────
  {
    id: "session-010",
    userId: "user-2",
    date: "2026-03-23",
    startedAt: "2026-03-23T10:00:00",
    finishedAt: "2026-03-23T10:50:00",
    overallRpe: 6,
    caloriesBurned: 260,
    sets: [
      { id: "set-082", exerciseId: "ex-015", setNumber: 1, weightKg: 55, reps: 15, restSec: 60, rpe: 5 },
      { id: "set-083", exerciseId: "ex-015", setNumber: 2, weightKg: 55, reps: 15, restSec: 60, rpe: 6 },
      { id: "set-084", exerciseId: "ex-015", setNumber: 3, weightKg: 55, reps: 12, restSec: 60, rpe: 7 },
      { id: "set-085", exerciseId: "ex-017", setNumber: 1, weightKg: 30, reps: 15, restSec: 60, rpe: 5 },
      { id: "set-086", exerciseId: "ex-017", setNumber: 2, weightKg: 30, reps: 15, restSec: 60, rpe: 6 },
      { id: "set-087", exerciseId: "ex-017", setNumber: 3, weightKg: 30, reps: 12, restSec: 60, rpe: 7 },
      { id: "set-088", exerciseId: "ex-021", setNumber: 1, weightKg: 0, reps: 30, restSec: 45, rpe: 5 },
      { id: "set-089", exerciseId: "ex-021", setNumber: 2, weightKg: 0, reps: 30, restSec: 45, rpe: 5 },
      { id: "set-090", exerciseId: "ex-021", setNumber: 3, weightKg: 0, reps: 25, restSec: 45, rpe: 6 },
    ],
  },
  {
    id: "session-011",
    userId: "user-2",
    date: "2026-03-25",
    startedAt: "2026-03-25T10:00:00",
    finishedAt: "2026-03-25T11:05:00",
    overallRpe: 7,
    caloriesBurned: 300,
    sets: [
      { id: "set-091", exerciseId: "ex-007", setNumber: 1, weightKg: 32, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-092", exerciseId: "ex-007", setNumber: 2, weightKg: 32, reps: 12, restSec: 60, rpe: 7 },
      { id: "set-093", exerciseId: "ex-007", setNumber: 3, weightKg: 32, reps: 10, restSec: 60, rpe: 7 },
      { id: "set-094", exerciseId: "ex-012", setNumber: 1, weightKg: 6, reps: 15, restSec: 45, rpe: 5 },
      { id: "set-095", exerciseId: "ex-012", setNumber: 2, weightKg: 6, reps: 15, restSec: 45, rpe: 6 },
      { id: "set-096", exerciseId: "ex-012", setNumber: 3, weightKg: 6, reps: 12, restSec: 45, rpe: 6 },
      { id: "set-097", exerciseId: "ex-022", setNumber: 1, weightKg: 0, reps: 20, restSec: 45, rpe: 5 },
      { id: "set-098", exerciseId: "ex-022", setNumber: 2, weightKg: 0, reps: 20, restSec: 45, rpe: 5 },
      { id: "set-099", exerciseId: "ex-022", setNumber: 3, weightKg: 0, reps: 15, restSec: 45, rpe: 6 },
    ],
  },
  {
    id: "session-012",
    userId: "user-2",
    date: "2026-03-27",
    startedAt: "2026-03-27T10:00:00",
    finishedAt: "2026-03-27T11:00:00",
    overallRpe: 7,
    caloriesBurned: 290,
    memo: "전신 마무리 운동",
    sets: [
      { id: "set-100", exerciseId: "ex-005", setNumber: 1, weightKg: 8, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-101", exerciseId: "ex-005", setNumber: 2, weightKg: 8, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-102", exerciseId: "ex-005", setNumber: 3, weightKg: 8, reps: 10, restSec: 60, rpe: 7 },
      { id: "set-103", exerciseId: "ex-016", setNumber: 1, weightKg: 10, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-104", exerciseId: "ex-016", setNumber: 2, weightKg: 10, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-105", exerciseId: "ex-016", setNumber: 3, weightKg: 10, reps: 10, restSec: 60, rpe: 7 },
      { id: "set-106", exerciseId: "ex-009", setNumber: 1, weightKg: 28, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-107", exerciseId: "ex-009", setNumber: 2, weightKg: 28, reps: 12, restSec: 60, rpe: 6 },
      { id: "set-108", exerciseId: "ex-009", setNumber: 3, weightKg: 28, reps: 10, restSec: 60, rpe: 7 },
    ],
  },
]
