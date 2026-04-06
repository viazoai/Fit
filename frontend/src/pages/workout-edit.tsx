import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useWorkouts } from "@/context/workout-context"
import { useExercises } from "@/context/exercise-context"
import { getWorkout } from "@/lib/api"
import { LoggingStep } from "@/components/workout/LoggingStep"
import { SelectExercisesStep } from "@/components/workout/SelectExercisesStep"
import type { Exercise, ActiveExercise, WorkoutSessionRead } from "@/types"

type Step = "logging" | "add-exercises"

function sessionToActiveExercises(detail: WorkoutSessionRead): ActiveExercise[] {
  return detail.exercise_logs.map((log) => ({
    exerciseId: log.exercise_id,
    sets: log.sets.map((s) => ({
      exerciseId: log.exercise_id,
      setNumber: s.set_index,
      weightKg: s.weight_kg ?? 0,
      reps: s.reps ?? 0,
      rpe: 7,
    })),
    durationMin: log.duration_min ?? undefined,
    distanceKm: log.distance_km ?? undefined,
    speedKmh: log.speed_kmh ?? undefined,
    inclinePct: log.incline_pct ?? undefined,
  }))
}

export default function WorkoutEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { editWorkout } = useWorkouts()
  const { exercises: allExercises } = useExercises()

  const [step, setStep] = useState<Step>("logging")
  const [detail, setDetail] = useState<WorkoutSessionRead | null>(null)
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([])
  const [durationMin, setDurationMin] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getWorkout(Number(id))
      .then((d) => {
        setDetail(d)
        if (d.duration_min != null) setDurationMin(String(d.duration_min))
        const active = sessionToActiveExercises(d)
        setActiveExercises(active)
        // ExerciseLog에서 exercise 객체 복원 (name/type만 있으므로 allExercises에서 찾기)
        const exercises = active.map((ae) =>
          allExercises.find((e) => e.id === ae.exerciseId)
        ).filter(Boolean) as Exercise[]
        setSelectedExercises(exercises)
      })
      .catch(() => setError("기록을 불러올 수 없어요."))
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleComplete(completed: ActiveExercise[], elapsedSec: number) {
    if (!id || !detail) return
    setSaving(true)
    try {
      const exerciseLogs = completed
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

      const parsedDuration = parseInt(durationMin)
      await editWorkout(Number(id), {
        memo: detail.memo,
        duration_min: isNaN(parsedDuration) || parsedDuration <= 0 ? null : parsedDuration,
        exercise_logs: exerciseLogs,
      })
      navigate("/log")
    } catch (err) {
      console.error("수정 실패:", err)
    } finally {
      setSaving(false)
    }
  }

  function handleAddExercises(exercises: Exercise[]) {
    const newExercises = exercises.filter(
      (e) => !selectedExercises.some((s) => s.id === e.id)
    )
    setSelectedExercises((prev) => [...prev, ...newExercises])
    setActiveExercises((prev) => [
      ...prev,
      ...newExercises.map((e) => ({ exerciseId: e.id, sets: [] })),
    ])
    setStep("logging")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <p className="text-sm text-muted-foreground">{error ?? "기록을 찾을 수 없어요."}</p>
        <Button variant="secondary" onClick={() => navigate("/log")}>돌아가기</Button>
      </div>
    )
  }

  if (step === "add-exercises") {
    return (
      <SelectExercisesStep
        initialSelected={selectedExercises}
        onConfirm={handleAddExercises}
        onCancel={() => setStep("logging")}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/log")}>
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="text-base font-semibold">기록 수정</h1>
      </div>

      {/* 운동 시간 입력 */}
      <div className="px-4 pb-0.5">
        <Card>
          <CardContent className="py-0.5 px-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">총 운동 시간 (분)</label>
              <Input
                type="number"
                inputMode="numeric"
                step="1"
                placeholder="0"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                className="border-border"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <LoggingStep
        exercises={selectedExercises}
        initialActiveExercises={activeExercises}
        editMode
        onComplete={handleComplete}
        onCancel={() => navigate("/log")}
        onAddExercises={() => setStep("add-exercises")}
        onActiveExercisesChange={setActiveExercises}
      />

      {saving && (
        <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
          <p className="text-sm text-muted-foreground">저장 중...</p>
        </div>
      )}
    </div>
  )
}
