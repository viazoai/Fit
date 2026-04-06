import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { WorkoutSessionSummary, WorkoutSessionRead, Exercise, ActiveExercise } from "@/types"
import { getWorkouts, createWorkout as apiCreateWorkout, updateWorkout as apiUpdateWorkout, deleteWorkout as apiDeleteWorkout, getDraft, saveDraft, deleteDraft } from "@/lib/api"
import { useAuth } from "@/context/auth-context"

const DRAFT_LS_KEY = "fit-workout-draft"

function readLocalDraft(): SessionState | null {
  try {
    const raw = localStorage.getItem(DRAFT_LS_KEY)
    return raw ? (JSON.parse(raw) as SessionState) : null
  } catch {
    return null
  }
}

interface SessionState {
  step: "select-exercises" | "logging"
  selectedExercises: Exercise[]
  activeExercises: ActiveExercise[]
  startedAt: string
}

interface WorkoutContextValue {
  /** 세션 요약 목록 (캘린더/리스트 표시용) */
  summaries: WorkoutSessionSummary[]
  /** 운동 기록 추가 (API 호출 후 로컬 갱신) */
  saveWorkout: (body: Parameters<typeof apiCreateWorkout>[0]) => Promise<WorkoutSessionRead>
  /** 운동 기록 수정 (API 호출 후 로컬 갱신) */
  editWorkout: (id: number, body: Parameters<typeof apiUpdateWorkout>[1]) => Promise<WorkoutSessionRead>
  /** 운동 기록 삭제 (API 호출 후 로컬 갱신) */
  removeWorkout: (id: number) => Promise<void>
  /** 목록 새로고침 */
  refreshSummaries: () => Promise<void>
  loading: boolean
  isWorkoutActive: boolean
  setWorkoutActive: (active: boolean) => void
  session: SessionState | null
  setSession: (state: SessionState) => void
  clearSession: () => void
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null)

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { ready } = useAuth()
  const [summaries, setSummaries] = useState<WorkoutSessionSummary[]>([])
  const [loading, setLoading] = useState(true)

  // localStorage에서 초기값 복원 (새로고침 즉시 대응)
  const [isWorkoutActive, setWorkoutActive] = useState<boolean>(() => readLocalDraft() !== null)
  const [session, setSessionState] = useState<SessionState | null>(() => readLocalDraft())

  // DB 저장용 디바운스 타이머
  const dbSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function loadSummaries() {
    try {
      const data = await getWorkouts()
      setSummaries(data)
    } catch (err) {
      console.error("운동 기록 로드 실패:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!ready) return
    loadSummaries()

    // localStorage에 없을 때만 DB에서 복원 (localStorage 지워진 경우 방어)
    if (!readLocalDraft()) {
      getDraft().then((result) => {
        if (result) {
          const restored = result.data as SessionState
          localStorage.setItem(DRAFT_LS_KEY, JSON.stringify(restored))
          setSessionState(restored)
          setWorkoutActive(true)
        }
      }).catch(() => {})
    }
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveWorkout(body: Parameters<typeof apiCreateWorkout>[0]) {
    const result = await apiCreateWorkout(body)
    await loadSummaries()
    return result
  }

  async function editWorkout(id: number, body: Parameters<typeof apiUpdateWorkout>[1]) {
    const result = await apiUpdateWorkout(id, body)
    await loadSummaries()
    return result
  }

  async function removeWorkout(id: number) {
    await apiDeleteWorkout(id)
    await loadSummaries()
  }

  function setSession(state: SessionState) {
    setSessionState(state)

    // 즉시 localStorage 저장
    localStorage.setItem(DRAFT_LS_KEY, JSON.stringify(state))

    // DB 저장 — 2초 디바운스 (잦은 세트 기록 시 과도한 API 호출 방지)
    if (dbSaveTimerRef.current) clearTimeout(dbSaveTimerRef.current)
    dbSaveTimerRef.current = setTimeout(() => {
      saveDraft(state).catch(() => {})
    }, 2000)
  }

  function clearSession() {
    setSessionState(null)

    // 진행 중 DB 저장 취소
    if (dbSaveTimerRef.current) clearTimeout(dbSaveTimerRef.current)

    // localStorage 삭제
    localStorage.removeItem(DRAFT_LS_KEY)

    // DB draft 삭제 (best-effort)
    deleteDraft().catch(() => {})
  }

  return (
    <WorkoutContext
      value={{
        summaries,
        saveWorkout,
        editWorkout,
        removeWorkout,
        refreshSummaries: loadSummaries,
        loading,
        isWorkoutActive,
        setWorkoutActive,
        session,
        setSession,
        clearSession,
      }}
    >
      {children}
    </WorkoutContext>
  )
}

export function useWorkouts(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext)
  if (!ctx) throw new Error("useWorkouts must be used within WorkoutProvider")
  return ctx
}
