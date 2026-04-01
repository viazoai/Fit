import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCurrentUser } from "@/context/user-context"
import { useWorkouts } from "@/context/workout-context"
import { usePoints, type EarnResult } from "@/context/points-context"
import { useToast } from "@/context/toast-context"
import { SelectExercisesStep } from "@/components/workout/SelectExercisesStep"
import { LoggingStep } from "@/components/workout/LoggingStep"
import { CompleteStep } from "@/components/workout/CompleteStep"
import type { ActiveExercise, Exercise } from "@/types"

type Step = "select-exercises" | "logging" | "complete"

export default function WorkoutLogPage() {
  const navigate = useNavigate()
  const { currentUserId } = useCurrentUser()
  const { workouts, addWorkout, setWorkoutActive, session, setSession, clearSession } = useWorkouts()
  const { earnPoints } = usePoints()
  const { toast } = useToast()

  // 진행 중인 세션 복원: 탭 이동 후 돌아왔을 때
  const [step, setStep] = useState<Step>(() => {
    if (session?.step === "logging") return "logging"
    return "select-exercises"
  })
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(
    () => session?.selectedExercises ?? []
  )
  const [startedAt, setStartedAt] = useState(() => session?.startedAt ?? "")
  const [completedExercises, setCompletedExercises] = useState<ActiveExercise[]>([])
  const [completedElapsedSec, setCompletedElapsedSec] = useState(0)

  function handleSelectExercises(exercises: Exercise[]) {
    const now = new Date().toISOString()
    setSelectedExercises(exercises)
    setStartedAt(now)
    setWorkoutActive(true)
    setSession({
      step: "logging",
      selectedExercises: exercises,
      activeExercises: exercises.map((e) => ({ exerciseId: e.id, sets: [] })),
      startedAt: now,
    })
    setStep("logging")
  }

  function handleActiveExercisesChange(exercises: ActiveExercise[]) {
    if (session) {
      setSession({ ...session, activeExercises: exercises })
    }
  }

  function handleCompleteLogging(activeExercises: ActiveExercise[], elapsedSec: number) {
    setCompletedExercises(activeExercises)
    setCompletedElapsedSec(elapsedSec)
    setStep("complete")
  }

  function handleSaveWorkout(memo: string): EarnResult | null {
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
    if (sets.length === 0) return null

    const newSession = {
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
    }
    addWorkout(newSession)

    // 포인트 획득 (현재 workouts + 새 세션 포함하여 스트릭 계산)
    const updatedWorkouts = [newSession, ...workouts]
    const result = earnPoints(currentUserId, today, updatedWorkouts)

    // 스트릭 보너스 토스트
    if (result) {
      const streakBonus = result.breakdown.find((b) => b.reason.includes("연속 달성"))
      if (streakBonus) {
        toast(`🔥 ${streakBonus.reason}! +${streakBonus.amount}P`)
      }
      const coupleBonus = result.breakdown.find((b) => b.reason.includes("커플"))
      if (coupleBonus) {
        toast(`👫 ${coupleBonus.reason}! +${coupleBonus.amount}P`)
      }
    }

    return result
  }

  function handleGoLog() {
    setWorkoutActive(false)
    clearSession()
    setSelectedExercises([])
    setCompletedExercises([])
    setCompletedElapsedSec(0)
    navigate("/")
  }

  function handleRestart() {
    clearSession()
    setStep("select-exercises")
    setSelectedExercises([])
    setCompletedExercises([])
    setCompletedElapsedSec(0)
  }

  if (step === "select-exercises") {
    return (
      <SelectExercisesStep
        onConfirm={handleSelectExercises}
      />
    )
  }

  if (step === "logging") {
    return (
      <LoggingStep
        exercises={selectedExercises}
        initialActiveExercises={session?.activeExercises}
        onComplete={handleCompleteLogging}
        onActiveExercisesChange={handleActiveExercisesChange}
      />
    )
  }

  if (step === "complete") {
    return (
      <CompleteStep
        exercises={selectedExercises}
        activeExercises={completedExercises}
        elapsedSec={completedElapsedSec}
        onGoHome={handleGoLog}
        onRestart={handleRestart}
        onSave={handleSaveWorkout}
      />
    )
  }

  return null
}
