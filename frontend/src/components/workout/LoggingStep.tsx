import { useState, useEffect, useRef } from "react"
import { Plus, Trash2, CheckCircle2, Timer, Youtube, X, Pause, Play, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RpeSlider } from "@/components/workout/rpe-slider"
import { formatSeconds } from "@/lib/date-utils"
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  getElapsedMs,
  isPaused as getIsPaused,
  hasActiveTimer,
  clearTimer,
} from "@/lib/timer-storage"
import { useWorkouts } from "@/context/workout-context"
import { useCurrentUser } from "@/context/user-context"
import { mockExercises } from "@/mocks"
import { BODY_PART_KO, BODY_PARTS, DIFFICULTY_KO, DIFFICULTY_VARIANT } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Exercise, WorkoutSession } from "@/types"

export interface ActiveSet {
  exerciseId: string
  setNumber: number
  weightKg: number
  reps: number
  rpe: number
}

export interface ActiveExercise {
  exerciseId: string
  sets: ActiveSet[]
}

// H: 과거 기록에서 마지막 세트를 찾아 반환
function getLastHistoricalSet(
  exerciseId: string,
  workouts: WorkoutSession[],
  userId: string
): { weightKg: number; reps: number; rpe: number } | null {
  const sessions = workouts
    .filter((w) => w.userId === userId && w.sets.some((s) => s.exerciseId === exerciseId))
    .sort((a, b) => b.date.localeCompare(a.date))
  const lastSession = sessions[0]
  if (!lastSession) return null
  const sets = lastSession.sets.filter((s) => s.exerciseId === exerciseId)
  const lastSet = sets.at(-1)
  if (!lastSet) return null
  return { weightKg: lastSet.weightKg, reps: lastSet.reps, rpe: lastSet.rpe ?? 7 }
}

function MiniTrendChart({ exerciseId, userId }: { exerciseId: string; userId: string }) {
  const { workouts } = useWorkouts()
  const MAX_BARS = 8
  const BAR_W = 10
  const GAP = 3
  const H = 36

  const history = workouts
    .filter((w) => w.userId === userId && w.sets.some((s) => s.exerciseId === exerciseId))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-MAX_BARS)
    .map((w) => {
      const weights = w.sets
        .filter((s) => s.exerciseId === exerciseId && s.weightKg > 0)
        .map((s) => s.weightKg)
      return weights.length > 0 ? Math.max(...weights) : 0
    })

  if (history.length === 0) return null

  const maxVal = Math.max(...history, 1)
  const svgW = history.length * (BAR_W + GAP) - GAP

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] text-muted-foreground">최대 중량 추이</p>
      <svg width={svgW} height={H} className="overflow-visible">
        {history.map((val, i) => {
          const barH = Math.max((val / maxVal) * (H - 12), 2)
          const x = i * (BAR_W + GAP)
          const y = H - barH
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={BAR_W}
                height={barH}
                rx="2"
                fill="hsl(var(--chart-1) / 0.7)"
              />
              {i === history.length - 1 && (
                <text
                  x={x + BAR_W / 2}
                  y={y - 2}
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  className="text-muted-foreground"
                >
                  {val}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// G: 운동 추가 Dialog 내부 피커
function ExercisePickerDialog({
  open,
  excludeIds,
  onClose,
  onAdd,
}: {
  open: boolean
  excludeIds: Set<string>
  onClose: () => void
  onAdd: (exercise: Exercise) => void
}) {
  const [search, setSearch] = useState("")
  const [bodyPartFilter, setBodyPartFilter] = useState("all")

  const filtered = mockExercises.filter((e) => {
    if (excludeIds.has(e.id)) return false
    if (bodyPartFilter !== "all" && e.bodyPart !== bodyPartFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!e.nameKo.includes(search) && !e.nameEn.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>운동 추가</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 overflow-hidden">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="운동 이름 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* 부위 필터 */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              onClick={() => setBodyPartFilter("all")}
              className={cn(
                "shrink-0 h-7 rounded-full px-3 text-xs font-medium border transition-colors",
                bodyPartFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              )}
            >
              전체
            </button>
            {BODY_PARTS.map((part) => (
              <button
                key={part}
                onClick={() => setBodyPartFilter(part)}
                className={cn(
                  "shrink-0 h-7 rounded-full px-3 text-xs font-medium border transition-colors",
                  bodyPartFilter === part
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
              >
                {BODY_PART_KO[part]}
              </button>
            ))}
          </div>

          {/* 운동 목록 */}
          <div className="flex flex-col gap-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
            ) : (
              filtered.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => {
                    onAdd(exercise)
                    onClose()
                  }}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-left hover:border-muted-foreground/30 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium">{exercise.nameKo}</span>
                    <span className="text-xs text-muted-foreground">{exercise.primaryMuscle}</span>
                  </div>
                  <Badge variant={DIFFICULTY_VARIANT[exercise.difficulty] ?? "secondary"} className="shrink-0 ml-2">
                    {DIFFICULTY_KO[exercise.difficulty] ?? exercise.difficulty}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function LoggingStep({
  exercises: initialExercises,
  onComplete,
}: {
  exercises: Exercise[]
  onComplete: (activeExercises: ActiveExercise[], elapsedSec: number) => void
}) {
  const { workouts } = useWorkouts()
  const { currentUserId } = useCurrentUser()

  // G: exercises를 내부 state로 전환
  const [currentExercises, setCurrentExercises] = useState<Exercise[]>(initialExercises)
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(() =>
    initialExercises.map((e) => ({ exerciseId: e.id, sets: [] }))
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPicker, setShowPicker] = useState(false)

  // J: localStorage 기반 타이머
  const [elapsedSec, setElapsedSec] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [weightKg, setWeightKg] = useState("")
  const [reps, setReps] = useState("")
  const [rpe, setRpe] = useState(7)

  // J: 타이머 초기화 (복원 or 신규)
  useEffect(() => {
    if (!hasActiveTimer()) {
      startTimer()
    } else {
      setPaused(getIsPaused())
      setElapsedSec(Math.floor(getElapsedMs() / 1000))
    }

    intervalRef.current = setInterval(() => {
      if (!getIsPaused()) {
        setElapsedSec(Math.floor(getElapsedMs() / 1000))
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // H: 탭 전환 시 — 현재 세션 세트 없으면 과거 기록에서 자동 채움
  useEffect(() => {
    const lastSet = activeExercises[currentIndex]?.sets.at(-1)
    if (lastSet) {
      setWeightKg(String(lastSet.weightKg))
      setRpe(lastSet.rpe)
    } else {
      const currentExercise = currentExercises[currentIndex]
      if (currentExercise) {
        const hist = getLastHistoricalSet(currentExercise.id, workouts, currentUserId)
        if (hist) {
          setWeightKg(String(hist.weightKg))
          setReps(String(hist.reps))
          setRpe(hist.rpe)
        } else {
          setWeightKg("")
          setReps("")
          setRpe(7)
        }
      }
    }
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentExercise = currentExercises[currentIndex]
  const currentActive = activeExercises[currentIndex]

  function addSet() {
    const w = parseFloat(weightKg)
    const r = parseInt(reps)
    if (isNaN(w) || isNaN(r) || r <= 0) return

    const newSet: ActiveSet = {
      exerciseId: currentExercise.id,
      setNumber: currentActive.sets.length + 1,
      weightKg: w,
      reps: r,
      rpe,
    }

    setActiveExercises((prev) =>
      prev.map((ae, i) =>
        i === currentIndex ? { ...ae, sets: [...ae.sets, newSet] } : ae
      )
    )
    setReps("")
  }

  function removeLastSet() {
    setActiveExercises((prev) =>
      prev.map((ae, i) =>
        i === currentIndex && ae.sets.length > 0
          ? { ...ae, sets: ae.sets.slice(0, -1) }
          : ae
      )
    )
  }

  // G: 운동 추가
  function handleAddExercise(exercise: Exercise) {
    setCurrentExercises((prev) => [...prev, exercise])
    setActiveExercises((prev) => [...prev, { exerciseId: exercise.id, sets: [] }])
  }

  // G: 운동 삭제
  function handleRemoveExercise(index: number) {
    setCurrentExercises((prev) => prev.filter((_, i) => i !== index))
    setActiveExercises((prev) => prev.filter((_, i) => i !== index))
    setCurrentIndex((prev) => Math.min(prev, currentExercises.length - 2))
  }

  // J: 일시정지 토글
  function togglePause() {
    if (paused) {
      resumeTimer()
      setPaused(false)
    } else {
      pauseTimer()
      setPaused(true)
    }
  }

  // J: 완료 시 타이머 정리
  function handleComplete() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    clearTimer()
    onComplete(activeExercises, elapsedSec)
  }

  const currentExerciseIds = new Set(currentExercises.map((e) => e.id))

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-24">
      {/* 타이머 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Timer className="size-4" />
          <span className="text-sm font-mono font-medium">{formatSeconds(elapsedSec)}</span>
          {/* J: 일시정지 버튼 */}
          <button
            onClick={togglePause}
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={paused ? "타이머 재개" : "타이머 일시정지"}
          >
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {currentIndex + 1} / {currentExercises.length} 종목
        </p>
      </div>

      {/* 운동 탭 선택 (G: 탭별 × 버튼 + 끝에 + 버튼) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {currentExercises.map((exercise, i) => (
          <div key={exercise.id} className="relative shrink-0">
            <button
              onClick={() => setCurrentIndex(i)}
              className={[
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                currentExercises.length > 1 ? "pr-6" : "",
                i === currentIndex
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30",
              ].join(" ")}
            >
              {exercise.nameKo}
              {activeExercises[i].sets.length > 0 && (
                <span className="ml-1 text-[10px] opacity-70">
                  {activeExercises[i].sets.length}세트
                </span>
              )}
            </button>
            {/* G: 삭제 버튼 (최소 1개일 때 숨김) */}
            {currentExercises.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveExercise(i)
                }}
                className={[
                  "absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors",
                  i === currentIndex
                    ? "text-primary-foreground/70 hover:text-primary-foreground"
                    : "text-muted-foreground/50 hover:text-muted-foreground",
                ].join(" ")}
                aria-label={`${exercise.nameKo} 삭제`}
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        ))}

        {/* G: 운동 추가 버튼 */}
        <button
          onClick={() => setShowPicker(true)}
          className="shrink-0 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors"
          aria-label="운동 추가"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* 현재 운동 카드 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{currentExercise.nameKo}</CardTitle>
          <p className="text-xs text-muted-foreground">{currentExercise.primaryMuscle}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* 이전 세트 기록 테이블 */}
          {currentActive.sets.length > 0 && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">기록된 세트</p>
              <div className="flex flex-col gap-1">
                <div className="grid grid-cols-4 text-[11px] font-medium text-muted-foreground">
                  <span>세트</span>
                  <span className="text-right">무게</span>
                  <span className="text-right">횟수</span>
                  <span className="text-right">RPE</span>
                </div>
                <Separator />
                {currentActive.sets.map((set) => (
                  <div key={set.setNumber} className="grid grid-cols-4 text-xs">
                    <span className="font-medium">{set.setNumber}</span>
                    <span className="text-right">{set.weightKg}kg</span>
                    <span className="text-right">{set.reps}회</span>
                    <span className="text-right text-muted-foreground">{set.rpe}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 새 세트 입력 */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium">세트 {currentActive.sets.length + 1} 입력</p>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">무게 (kg)</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">횟수</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>
            </div>

            <RpeSlider value={rpe} onChange={setRpe} />

            <div className="flex gap-2">
              <Button className="flex-1" onClick={addSet} disabled={!weightKg || !reps}>
                <Plus />
                세트 추가
              </Button>
              {currentActive.sets.length > 0 && (
                <Button variant="destructive" size="icon" onClick={removeLastSet}>
                  <Trash2 />
                </Button>
              )}
            </div>
          </div>

          {/* 트렌드 + YouTube */}
          {(() => {
            const hasTrend = currentExercise.equipment !== "bodyweight"
            const hasYoutube = !!currentExercise.youtubeUrl
            if (!hasTrend && !hasYoutube) return null
            return (
              <div className="flex items-end justify-between gap-3 pt-1">
                {hasTrend && (
                  <MiniTrendChart exerciseId={currentExercise.id} userId={currentUserId} />
                )}
                {hasYoutube && (
                  <a
                    href={currentExercise.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Youtube className="size-3.5" />
                    영상 보기
                  </a>
                )}
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* 운동 완료 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <Button className="w-full" onClick={handleComplete}>
          <CheckCircle2 />
          운동 완료
        </Button>
      </div>

      {/* G: 운동 추가 다이얼로그 */}
      <ExercisePickerDialog
        open={showPicker}
        excludeIds={currentExerciseIds}
        onClose={() => setShowPicker(false)}
        onAdd={handleAddExercise}
      />
    </div>
  )
}
