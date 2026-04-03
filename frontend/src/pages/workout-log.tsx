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
import { clearTimer } from "@/lib/timer-storage"

type Step = "select-exercises" | "logging" | "add-exercises" | "complete"

export default function WorkoutLogPage() {
  const navigate = useNavigate()
  const { currentUserId } = useCurrentUser()
  const { saveWorkout, summaries, setWorkoutActive, session, setSession, clearSession } = useWorkouts()
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
  const [completedExercises, setCompletedExercises] = useState<ActiveExercise[]>([])
  const [completedElapsedSec, setCompletedElapsedSec] = useState(0)

  function handleSelectExercises(exercises: Exercise[]) {
    clearTimer()
    const now = new Date().toISOString()
    setSelectedExercises(exercises)
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

  async function handleSaveWorkout(memo: string): Promise<EarnResult | null> {
    const today = new Date().toISOString().split("T")[0]

    // API body 구성 — 세트가 있거나 유산소/스트레칭 값이 있는 경우 포함
    const exerciseLogs = completedExercises
      .filter((ae) => ae.sets.length > 0 || ae.durationMin !== undefined || ae.distanceKm !== undefined)
      .map((ae, idx) => ({
        exercise_id: ae.exerciseId,
        order_index: idx,
        duration_min: ae.durationMin,
        distance_km: ae.distanceKm,
        speed_kmh: ae.speedKmh,
        incline_pct: ae.inclinePct,
        sets: ae.sets.map((s) => ({
          set_index: s.setNumber,
          reps: s.reps,
          weight_kg: s.weightKg,
        })),
      }))

    if (exerciseLogs.length === 0) return null

    // 저장 완료를 기다린 후 홈으로 이동
    await saveWorkout({
      date: today,
      memo: memo || undefined,
      duration_min: completedElapsedSec > 0 ? Math.round(completedElapsedSec / 60) : undefined,
      exercise_logs: exerciseLogs,
    })

    // 포인트 획득
    const result = earnPoints(currentUserId, today, summaries)

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
    setWorkoutActive(false)
    clearSession()
    setStep("select-exercises")
    setSelectedExercises([])
    setCompletedExercises([])
    setCompletedElapsedSec(0)
  }

  function handleAddMoreExercises(newExercises: Exercise[]) {
    const allExercises = [...selectedExercises, ...newExercises]
    setSelectedExercises(allExercises)
    if (session) {
      setSession({
        ...session,
        selectedExercises: allExercises,
        activeExercises: [
          ...session.activeExercises,
          ...newExercises.map((e) => ({ exerciseId: e.id, sets: [] })),
        ],
      })
    }
    setStep("logging")
  }

  if (step === "select-exercises") {
    return (
      <SelectExercisesStep
        onConfirm={handleSelectExercises}
      />
    )
  }

  if (step === "add-exercises") {
    return (
      <SelectExercisesStep
        onConfirm={handleAddMoreExercises}
        onCancel={() => setStep("logging")}
        excludeIds={new Set(selectedExercises.map((e) => e.id))}
      />
    )
  }

  if (step === "logging") {
    return (
      <LoggingStep
        exercises={selectedExercises}
        initialActiveExercises={session?.activeExercises}
        onComplete={handleCompleteLogging}
        onCancel={handleRestart}
        onAddExercises={() => setStep("add-exercises")}
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
