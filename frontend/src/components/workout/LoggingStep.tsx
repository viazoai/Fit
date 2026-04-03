import { useState, useEffect, useRef } from "react"
import { Plus, Trash2, CheckCircle2, Timer, Youtube, X, Pause, Play, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
import type { Exercise, ActiveSet, ActiveExercise } from "@/types"

export type { ActiveSet, ActiveExercise }

export function LoggingStep({
  exercises: initialExercises,
  initialActiveExercises,
  onComplete,
  onCancel,
  onAddExercises,
  onActiveExercisesChange,
}: {
  exercises: Exercise[]
  initialActiveExercises?: ActiveExercise[]
  onComplete: (activeExercises: ActiveExercise[], elapsedSec: number) => void
  onCancel: () => void
  onAddExercises: () => void
  onActiveExercisesChange?: (exercises: ActiveExercise[]) => void
}) {
  // exercises를 내부 state로 전환
  const [currentExercises, setCurrentExercises] = useState<Exercise[]>(initialExercises)
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(() => {
    if (initialActiveExercises && initialActiveExercises.length > 0) {
      return initialActiveExercises
    }
    return initialExercises.map((e) => ({ exerciseId: e.id, sets: [] }))
  })

  function updateActiveExercises(updated: ActiveExercise[]) {
    setActiveExercises(updated)
    onActiveExercisesChange?.(updated)
  }
  const [currentIndex, setCurrentIndex] = useState(0)

  // localStorage 기반 타이머
  const [elapsedSec, setElapsedSec] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [weightKg, setWeightKg] = useState("")
  const [reps, setReps] = useState("")
  const [rpe, setRpe] = useState(7)

  // 유산소/스트레칭 입력 상태
  const [durationMin, setDurationMin] = useState("")
  const [distanceKm, setDistanceKm] = useState("")
  const [speedKmh, setSpeedKmh] = useState("")
  const [inclinePct, setInclinePct] = useState("")
  const [cardioSaved, setCardioSaved] = useState(false)

  // 타이머 초기화 (복원 or 신규)
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

  // 탭 전환 시 — 마지막 세트 값 복원, 유산소/스트레칭 값 복원
  useEffect(() => {
    const lastSet = activeExercises[currentIndex]?.sets.at(-1)
    if (lastSet) {
      setWeightKg(String(lastSet.weightKg))
      setRpe(lastSet.rpe)
    } else {
      setWeightKg("")
      setReps("")
      setRpe(7)
    }

    // 유산소/스트레칭 기존 값 복원
    const ae = activeExercises[currentIndex]
    setDurationMin(ae?.durationMin !== undefined ? String(ae.durationMin) : "")
    setDistanceKm(ae?.distanceKm !== undefined ? String(ae.distanceKm) : "")
    setSpeedKmh(ae?.speedKmh !== undefined ? String(ae.speedKmh) : "")
    setInclinePct(ae?.inclinePct !== undefined ? String(ae.inclinePct) : "")
    setCardioSaved(ae?.durationMin !== undefined)
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

    updateActiveExercises(
      activeExercises.map((ae, i) =>
        i === currentIndex ? { ...ae, sets: [...ae.sets, newSet] } : ae
      )
    )
    setReps("")
  }

  function removeLastSet() {
    updateActiveExercises(
      activeExercises.map((ae, i) =>
        i === currentIndex && ae.sets.length > 0
          ? { ...ae, sets: ae.sets.slice(0, -1) }
          : ae
      )
    )
  }

  // 유산소/스트레칭 기록 저장
  function saveCardioRecord() {
    const dur = parseFloat(durationMin) || undefined
    const dist = parseFloat(distanceKm) || undefined
    const spd = parseFloat(speedKmh) || undefined
    const inc = parseFloat(inclinePct) || undefined

    updateActiveExercises(
      activeExercises.map((ae, i) =>
        i === currentIndex
          ? { ...ae, durationMin: dur, distanceKm: dist, speedKmh: spd, inclinePct: inc }
          : ae
      )
    )
    setCardioSaved(true)
  }

  // 운동 삭제
  function handleRemoveExercise(index: number) {
    setCurrentExercises((prev) => prev.filter((_, i) => i !== index))
    updateActiveExercises(activeExercises.filter((_, i) => i !== index))
    setCurrentIndex((prev) => Math.min(prev, currentExercises.length - 2))
  }

  // 일시정지 토글
  function togglePause() {
    if (paused) {
      resumeTimer()
      setPaused(false)
    } else {
      pauseTimer()
      setPaused(true)
    }
  }

  // 완료 시 타이머 정리
  function handleComplete() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    clearTimer()
    onComplete(activeExercises, elapsedSec)
  }


  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-24">
      {/* 타이머 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Timer className="size-4" />
          <span className="text-sm font-mono font-medium">{formatSeconds(elapsedSec)}</span>
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

      {/* 운동 탭 선택 */}
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
              {exercise.name}
              {activeExercises[i].sets.length > 0 && (
                <span className="ml-1 text-[10px] opacity-70">
                  {activeExercises[i].sets.length}세트
                </span>
              )}
              {activeExercises[i].sets.length === 0 && activeExercises[i].durationMin !== undefined && (
                <span className="ml-1 text-[10px] opacity-70">
                  {activeExercises[i].durationMin}분
                </span>
              )}
            </button>
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
                aria-label={`${exercise.name} 삭제`}
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        ))}

        {/* 운동 추가 버튼 */}
        <button
          onClick={onAddExercises}
          className="shrink-0 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors"
          aria-label="운동 추가"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* 현재 운동 카드 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{currentExercise.name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {currentExercise.muscle_group ?? currentExercise.type}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* 운동 타입별 입력 UI */}
          {(currentExercise.type === "유산소") && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium">유산소 기록</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">시간 (분) *</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="30"
                    value={durationMin}
                    onChange={(e) => { setDurationMin(e.target.value); setCardioSaved(false) }}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">거리 (km)</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={distanceKm}
                    onChange={(e) => { setDistanceKm(e.target.value); setCardioSaved(false) }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">속도 (km/h)</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={speedKmh}
                    onChange={(e) => { setSpeedKmh(e.target.value); setCardioSaved(false) }}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">경사 (%)</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={inclinePct}
                    onChange={(e) => { setInclinePct(e.target.value); setCardioSaved(false) }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="flex-1"
                  onClick={saveCardioRecord}
                  disabled={!durationMin}
                >
                  <CheckCircle2 />
                  기록
                </Button>
                {cardioSaved && (
                  <span className="text-xs text-green-500 font-medium">저장됨</span>
                )}
              </div>
            </div>
          )}

          {(currentExercise.type === "스트레칭") && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium">스트레칭 기록</p>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">시간 (분)</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="10"
                  value={durationMin}
                  onChange={(e) => { setDurationMin(e.target.value); setCardioSaved(false) }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="flex-1"
                  onClick={saveCardioRecord}
                >
                  <CheckCircle2 />
                  기록
                </Button>
                {cardioSaved && (
                  <span className="text-xs text-green-500 font-medium">저장됨</span>
                )}
              </div>
            </div>
          )}

          {/* 기구/맨몸: 새 세트 입력 */}
          {(currentExercise.type === "기구" || currentExercise.type === "맨몸") && (
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

              {/* 기록된 세트 테이블 — 세트 추가 버튼 아래 */}
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
            </div>
          )}

          {/* YouTube 링크 */}
          {currentExercise.youtube_url && (
            <div className="flex items-end justify-end pt-1">
              <a
                href={currentExercise.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Youtube className="size-3.5" />
                영상 보기
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 이전/다음 버튼 */}
      {currentExercises.length > 1 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            <ChevronLeft className="size-4" />
            이전
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={currentIndex === currentExercises.length - 1}
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            다음
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* 운동 완료/취소 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 flex gap-2 px-4">
        <Button variant="outline" className="w-24 h-10" onClick={onCancel}>
          취소
        </Button>
        <Button className="flex-1 h-10" onClick={handleComplete}>
          <CheckCircle2 />
          운동 완료
        </Button>
      </div>

    </div>
  )
}
