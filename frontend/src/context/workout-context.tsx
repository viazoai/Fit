import { createContext, useContext, useState, type ReactNode } from "react"
import type { WorkoutSession } from "@/types"
import { mockWorkouts } from "@/mocks"

interface WorkoutContextValue {
  workouts: WorkoutSession[]
  addWorkout: (session: WorkoutSession) => void
  isWorkoutActive: boolean
  setWorkoutActive: (active: boolean) => void
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null)

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(mockWorkouts)
  const [isWorkoutActive, setWorkoutActive] = useState(false)

  function addWorkout(session: WorkoutSession) {
    setWorkouts((prev) => [session, ...prev])
  }

  return (
    <WorkoutContext value={{ workouts, addWorkout, isWorkoutActive, setWorkoutActive }}>
      {children}
    </WorkoutContext>
  )
}

export function useWorkouts(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext)
  if (!ctx) throw new Error("useWorkouts must be used within WorkoutProvider")
  return ctx
}
