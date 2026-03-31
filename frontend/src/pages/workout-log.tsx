import { useState, useEffect, useRef } from "react"
import {
  ChevronLeft,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  Dumbbell,
  Heart,
  Zap,
  Wind,
  User,
  Circle,
  LayoutGrid,
  Search,
  Timer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCurrentUser } from "@/context/user-context"
import { mockWorkouts, mockExercises } from "@/mocks"
import type { BodyPart, Exercise } from "@/types"

// ─── 타입 ────────────────────────────────────────────────────────────────────

type Step = "list" | "select-muscle" | "select-exercises" | "logging" | "complete"

interface ActiveSet {
  exerciseId: string
  setNumber: number
  weightKg: number
  reps: number
  rpe: number
}

interface ActiveExercise {
  exerciseId: string
  sets: ActiveSet[]
}

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })
}

function formatDuration(startedAt: string, finishedAt: string): string {
  const start = new Date(startedAt).getTime()
  const end = new Date(finishedAt).getTime()
  const diffMin = Math.round((end - start) / 60000)
  if (diffMin < 60) return `${diffMin}분`
  const h = Math.floor(diffMin / 60)
  const m = diffMin % 60
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

function formatSeconds(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function getExerciseName(exerciseId: string): string {
  return mockExercises.find((e) => e.id === exerciseId)?.nameKo ?? exerciseId
}

const bodyPartLabel: Record<BodyPart, string> = {
  chest: "가슴",
  back: "등",
  shoulder: "어깨",
  legs: "하체",
  arms: "팔",
  core: "코어",
  cardio: "유산소",
}

const difficultyLabel: Record<string, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
}

const difficultyVariant: Record<string, "default" | "secondary" | "outline"> = {
  beginner: "secondary",
  intermediate: "default",
  advanced: "outline",
}

// ─── 부위 아이콘 ────────────────────────────────────────────────────────────────

function BodyPartIcon({ bodyPart }: { bodyPart: BodyPart }) {
  const cls = "size-8 text-primary"
  switch (bodyPart) {
    case "chest": return <Dumbbell className={cls} />
    case "back": return <LayoutGrid className={cls} />
    case "shoulder": return <Zap className={cls} />
    case "legs": return <User className={cls} />
    case "arms": return <Circle className={cls} />
    case "core": return <Heart className={cls} />
    case "cardio": return <Wind className={cls} />
  }
}

// ─── step: list ──────────────────────────────────────────────────────────────

function WorkoutListStep({
  onStart,
  userId,
}: {
  onStart: () => void
  userId: string
}) {
  const userWorkouts = mockWorkouts
    .filter((w) => w.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">운동 기록</h1>
        <Button size="sm" onClick={onStart}>
          <Play className="size-3.5" />
          운동 시작
        </Button>
      </div>

      {/* 기록 목록 */}
      {userWorkouts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Dumbbell className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">아직 운동 기록이 없어요.<br />첫 운동을 시작해보세요!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {userWorkouts.map((session) => {
            const uniqueExerciseIds = [...new Set(session.sets.map((s) => s.exerciseId))]
            const exerciseNames = uniqueExerciseIds.map(getExerciseName)
            const duration =
              session.startedAt && session.finishedAt
                ? formatDuration(session.startedAt, session.finishedAt)
                : null

            return (
              <Card key={session.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-sm font-semibold">{formatDate(session.date)}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {exerciseNames.join(" · ")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {session.overallRpe != null && (
                        <Badge variant="outline">RPE {session.overallRpe}</Badge>
                      )}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="size-3" />
                      {session.sets.length}세트
                    </span>
                    {session.caloriesBurned != null && (
                      <span className="flex items-center gap-1">
                        <Zap className="size-3" />
                        {session.caloriesBurned}kcal
                      </span>
                    )}
                    {duration != null && (
                      <span className="flex items-center gap-1">
                        <Timer className="size-3" />
                        {duration}
                      </span>
                    )}
                  </div>

                  {session.memo && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2 italic">
                      "{session.memo}"
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── step: select-muscle ─────────────────────────────────────────────────────

const BODY_PARTS: BodyPart[] = ["chest", "back", "shoulder", "legs", "arms", "core", "cardio"]

function SelectMuscleStep({
  onBack,
  onSelect,
}: {
  onBack: () => void
  onSelect: (bodyPart: BodyPart) => void
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ChevronLeft />
        </Button>
        <h2 className="text-lg font-bold">어떤 부위를 운동할까요?</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {BODY_PARTS.map((part) => (
          <button
            key={part}
            onClick={() => onSelect(part)}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-6 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
          >
            <BodyPartIcon bodyPart={part} />
            <span>{bodyPartLabel[part]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── step: select-exercises ──────────────────────────────────────────────────

function SelectExercisesStep({
  bodyPart,
  onBack,
  onConfirm,
}: {
  bodyPart: BodyPart
  onBack: () => void
  onConfirm: (exercises: Exercise[]) => void
}) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = mockExercises
    .filter((e) => e.bodyPart === bodyPart)
    .filter(
      (e) =>
        e.nameKo.includes(search) ||
        e.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        e.primaryMuscle.includes(search)
    )

  function toggleExercise(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleConfirm() {
    const exercises = mockExercises.filter((e) => selected.has(e.id))
    onConfirm(exercises)
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ChevronLeft />
        </Button>
        <div>
          <h2 className="text-lg font-bold">운동을 선택하세요</h2>
          <p className="text-xs text-muted-foreground">{bodyPartLabel[bodyPart]}</p>
        </div>
      </div>

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

      {/* 운동 목록 */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
        ) : (
          filtered.map((exercise) => {
            const isSelected = selected.has(exercise.id)
            return (
              <button
                key={exercise.id}
                onClick={() => toggleExercise(exercise.id)}
                className={[
                  "flex items-center justify-between rounded-xl border p-3 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground/30",
                ].join(" ")}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium">{exercise.nameKo}</span>
                  <span className="text-xs text-muted-foreground">{exercise.primaryMuscle}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Badge variant={difficultyVariant[exercise.difficulty]}>
                    {difficultyLabel[exercise.difficulty]}
                  </Badge>
                  {isSelected && <CheckCircle2 className="size-4 text-primary" />}
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <Button
          className="w-full"
          disabled={selected.size === 0}
          onClick={handleConfirm}
        >
          {selected.size > 0 ? `${selected.size}개 선택 → 운동 시작` : "운동을 선택하세요"}
        </Button>
      </div>
    </div>
  )
}

// ─── step: logging ────────────────────────────────────────────────────────────

function LoggingStep({
  exercises,
  onComplete,
}: {
  exercises: Exercise[]
  onComplete: (activeExercises: ActiveExercise[], elapsedSec: number) => void
}) {
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(() =>
    exercises.map((e) => ({ exerciseId: e.id, sets: [] }))
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [elapsedSec, setElapsedSec] = useState(0)

  // 현재 운동 입력값 상태
  const [weightKg, setWeightKg] = useState("")
  const [reps, setReps] = useState("")
  const [rpe, setRpe] = useState(7)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsedSec((s) => s + 1)
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const currentExercise = exercises[currentIndex]
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

  function handleComplete() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    onComplete(activeExercises, elapsedSec)
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* 타이머 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Timer className="size-4" />
          <span className="text-sm font-mono font-medium">{formatSeconds(elapsedSec)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {currentIndex + 1} / {exercises.length} 종목
        </p>
      </div>

      {/* 운동 탭 선택 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {exercises.map((exercise, i) => (
          <button
            key={exercise.id}
            onClick={() => setCurrentIndex(i)}
            className={[
              "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
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
        ))}
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

            {/* RPE 슬라이더 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">운동 강도 (RPE)</label>
                <span className="text-sm font-medium">RPE {rpe}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>쉬움 (1)</span>
                <span>보통 (5)</span>
                <span>최대 (10)</span>
              </div>
            </div>

            {/* 세트 추가 / 삭제 */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={addSet}
                disabled={!weightKg || !reps}
              >
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
        </CardContent>
      </Card>

      {/* 운동 완료 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <Button className="w-full" onClick={handleComplete}>
          <CheckCircle2 />
          운동 완료
        </Button>
      </div>
    </div>
  )
}

// ─── step: complete ───────────────────────────────────────────────────────────

function CompleteStep({
  exercises,
  activeExercises,
  elapsedSec,
  onGoHome,
}: {
  exercises: Exercise[]
  activeExercises: ActiveExercise[]
  elapsedSec: number
  onGoHome: () => void
}) {
  const [memo, setMemo] = useState("")

  const totalSets = activeExercises.reduce((sum, ae) => sum + ae.sets.length, 0)
  const exerciseCount = activeExercises.filter((ae) => ae.sets.length > 0).length

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* 헤더 */}
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="size-14 text-primary" />
        <h2 className="text-2xl font-bold">운동 완료!</h2>
        <p className="text-sm text-muted-foreground">오늘도 수고했어요 💪</p>
      </div>

      {/* 요약 카드 */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 divide-x text-center">
            <div className="flex flex-col gap-0.5 pr-4">
              <span className="text-lg font-bold">{formatSeconds(elapsedSec)}</span>
              <span className="text-xs text-muted-foreground">운동 시간</span>
            </div>
            <div className="flex flex-col gap-0.5 px-4">
              <span className="text-lg font-bold">{totalSets}</span>
              <span className="text-xs text-muted-foreground">총 세트</span>
            </div>
            <div className="flex flex-col gap-0.5 pl-4">
              <span className="text-lg font-bold">{exerciseCount}</span>
              <span className="text-xs text-muted-foreground">종목 수</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 종목별 요약 */}
      {activeExercises.filter((ae) => ae.sets.length > 0).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">종목별 기록</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {activeExercises
              .filter((ae) => ae.sets.length > 0)
              .map((ae) => {
                const exercise = exercises.find((e) => e.id === ae.exerciseId)
                const maxWeight = Math.max(...ae.sets.map((s) => s.weightKg))
                return (
                  <div key={ae.exerciseId} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{exercise?.nameKo ?? ae.exerciseId}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{ae.sets.length}세트</span>
                      {maxWeight > 0 && <span>최대 {maxWeight}kg</span>}
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}

      {/* 메모 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">메모 (선택)</label>
        <Input
          placeholder="오늘 운동 메모를 남겨보세요..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 flex flex-col gap-2 px-4">
        <Button className="w-full" onClick={onGoHome}>
          홈으로 가기
        </Button>
        <Button variant="outline" className="w-full" onClick={onGoHome}>
          다시 기록하기
        </Button>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function WorkoutLogPage() {
  const { currentUserId } = useCurrentUser()

  const [step, setStep] = useState<Step>("list")
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null)
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])
  const [completedExercises, setCompletedExercises] = useState<ActiveExercise[]>([])
  const [completedElapsedSec, setCompletedElapsedSec] = useState(0)

  function handleStartWorkout() {
    setStep("select-muscle")
  }

  function handleSelectMuscle(bodyPart: BodyPart) {
    setSelectedBodyPart(bodyPart)
    setStep("select-exercises")
  }

  function handleSelectExercises(exercises: Exercise[]) {
    setSelectedExercises(exercises)
    setStep("logging")
  }

  function handleCompleteLogging(activeExercises: ActiveExercise[], elapsedSec: number) {
    setCompletedExercises(activeExercises)
    setCompletedElapsedSec(elapsedSec)
    setStep("complete")
  }

  function handleGoHome() {
    setStep("list")
    setSelectedBodyPart(null)
    setSelectedExercises([])
    setCompletedExercises([])
    setCompletedElapsedSec(0)
  }

  if (step === "list") {
    return (
      <WorkoutListStep
        userId={currentUserId}
        onStart={handleStartWorkout}
      />
    )
  }

  if (step === "select-muscle") {
    return (
      <SelectMuscleStep
        onBack={() => setStep("list")}
        onSelect={handleSelectMuscle}
      />
    )
  }

  if (step === "select-exercises" && selectedBodyPart) {
    return (
      <SelectExercisesStep
        bodyPart={selectedBodyPart}
        onBack={() => setStep("select-muscle")}
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
      />
    )
  }

  return null
}
