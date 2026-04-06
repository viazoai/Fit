import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { WorkoutSessionSummary, WorkoutSessionRead, Exercise, ActiveExercise } from "@/types"
import { getWorkouts, createWorkout as apiCreateWorkout, updateWorkout as apiUpdateWorkout, deleteWorkout as apiDeleteWorkout } from "@/lib/api"
import { useAuth } from "@/context/auth-context"

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
  const [isWorkoutActive, setWorkoutActive] = useState(false)
  const [session, setSessionState] = useState<SessionState | null>(null)

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
    if (ready) loadSummaries()
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveWorkout(body: Parameters<typeof apiCreateWorkout>[0]) {
    const result = await apiCreateWorkout(body)
    // 목록 새로고침
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
  }

  function clearSession() {
    setSessionState(null)
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
