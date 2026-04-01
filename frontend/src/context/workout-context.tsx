import { createContext, useContext, useState, type ReactNode } from "react"
import type { WorkoutSession, Exercise, ActiveExercise } from "@/types"
import { mockWorkouts } from "@/mocks"

interface SessionState {
  step: "select-exercises" | "logging"
  selectedExercises: Exercise[]
  activeExercises: ActiveExercise[]
  startedAt: string
}

interface WorkoutContextValue {
  workouts: WorkoutSession[]
  addWorkout: (session: WorkoutSession) => void
  isWorkoutActive: boolean
  setWorkoutActive: (active: boolean) => void
  session: SessionState | null
  setSession: (state: SessionState) => void
  clearSession: () => void
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null)

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(mockWorkouts)
  const [isWorkoutActive, setWorkoutActive] = useState(false)
  const [session, setSessionState] = useState<SessionState | null>(null)

  function addWorkout(s: WorkoutSession) {
    setWorkouts((prev) => [s, ...prev])
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
        workouts,
        addWorkout,
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
