import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useCurrentUser } from "@/context/user-context"
import { useWorkouts } from "@/context/workout-context"
import { WorkoutListStep } from "@/components/workout/WorkoutListStep"
import { SelectExercisesStep } from "@/components/workout/SelectExercisesStep"
import { LoggingStep } from "@/components/workout/LoggingStep"
import { CompleteStep } from "@/components/workout/CompleteStep"
import type { ActiveExercise } from "@/components/workout/LoggingStep"
import type { Exercise } from "@/types"

type Step = "list" | "select-exercises" | "logging" | "complete"

export default function WorkoutLogPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUserId } = useCurrentUser()
  const { workouts, addWorkout, setWorkoutActive } = useWorkouts()

  const [step, setStep] = useState<Step>("list")

  // FAB에서 startWorkout state로 진입 시 바로 운동 선택 화면으로
  useEffect(() => {
    if (location.state?.startWorkout) {
      setStep("select-exercises")
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state]) // eslint-disable-line react-hooks/exhaustive-deps
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])
  const [completedExercises, setCompletedExercises] = useState<ActiveExercise[]>([])
  const [completedElapsedSec, setCompletedElapsedSec] = useState(0)
  const [startedAt, setStartedAt] = useState("")

  function handleSelectExercises(exercises: Exercise[]) {
    setSelectedExercises(exercises)
    setStartedAt(new Date().toISOString())
    setWorkoutActive(true)
    setStep("logging")
  }

  function handleCompleteLogging(activeExercises: ActiveExercise[], elapsedSec: number) {
    setCompletedExercises(activeExercises)
    setCompletedElapsedSec(elapsedSec)
    setStep("complete")
  }

  function handleSaveWorkout(memo: string) {
    const now = new Date().toISOString()
    const today = now.split("T")[0]
    const sets = completedExercises.flatMap((ae) =>
      ae.sets.map((s) => ({
        id: `set-${crypto.randomUUID().slice(0, 8)}`,
        exerciseId: s.exerciseId,
        setNumber: s.setNumber,
        weightKg: s.weightKg,
        reps: s.reps,
        rpe: s.rpe,
      }))
    )
    if (sets.length === 0) return

    addWorkout({
      id: `session-${crypto.randomUUID().slice(0, 8)}`,
      userId: currentUserId,
      date: today,
      startedAt: startedAt || now,
      finishedAt: now,
      overallRpe: Math.round(
        sets.reduce((sum, s) => sum + (s.rpe ?? 0), 0) / sets.length
      ),
      memo: memo || undefined,
      sets,
    })
  }

  function handleGoHome() {
    setWorkoutActive(false)
    setStep("list")
    setSelectedExercises([])
    setCompletedExercises([])
    setCompletedElapsedSec(0)
  }

  function handleRestart() {
    setStep("select-exercises")
    setSelectedExercises([])
    setCompletedExercises([])
    setCompletedElapsedSec(0)
  }

  if (step === "list") {
    return (
      <WorkoutListStep
        userId={currentUserId}
        workouts={workouts}
      />
    )
  }

  if (step === "select-exercises") {
    return (
      <SelectExercisesStep
        onBack={() => setStep("list")}
        onConfirm={handleSelectExercises}
      />
    )
  }

  if (step === "logging") {
    return (
      <LoggingStep
        exercises={selectedExercises}
        onComplete={handleCompleteLogging}
      />
    )
  }

  if (step === "complete") {
    return (
      <CompleteStep
        exercises={selectedExercises}
        activeExercises={completedExercises}
        elapsedSec={completedElapsedSec}
        onGoHome={handleGoHome}
        onRestart={handleRestart}
        onSave={handleSaveWorkout}
      />
    )
  }

  return null
}
