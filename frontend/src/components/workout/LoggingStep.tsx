import { useState, useEffect, useRef } from "react"
import { Plus, Trash2, CheckCircle2, Youtube, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { RpeSlider } from "@/components/workout/rpe-slider"
// import { formatSeconds } from "@/lib/date-utils"
import {
  startTimer,
  getElapsedMs,
  isPaused as getIsPaused,
  hasActiveTimer,
  clearTimer,
} from "@/lib/timer-storage"
import { getLastExerciseLog } from "@/lib/api"
import type { Exercise, ActiveSet, ActiveExercise } from "@/types"

type LastSet = { weight_kg: number | null; reps: number | null }

export type { ActiveSet, ActiveExercise }

export function LoggingStep({
  exercises: initialExercises,
  initialActiveExercises,
  onComplete,
  onCancel,
  onAddExercises,
  onActiveExercisesChange,
  editMode = false,
  initialDurationMin,
}: {
  exercises: Exercise[]
  initialActiveExercises?: ActiveExercise[]
  onComplete: (activeExercises: ActiveExercise[], elapsedSec: number) => void
  onCancel: () => void
  onAddExercises: () => void
  onActiveExercisesChange?: (exercises: ActiveExercise[]) => void
  editMode?: boolean
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

  // 운동별 최근 수행 기록 캐시 (exerciseId → 세트 배열)
  const lastLogsRef = useRef<Map<number, LastSet[]>>(new Map())

  // localStorage 기반 타이머 (editMode에서는 사용 안 함)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [, setPaused] = useState(false)
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

  // 타이머 초기화 (복원 or 신규) — editMode에서는 스킵
  useEffect(() => {
    if (editMode) return
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 탭 전환 시 — 세트 값 자동입력 + 유산소/스트레칭 값 복원
  useEffect(() => {
    const ae = activeExercises[currentIndex]
    const exercise = currentExercises[currentIndex]
    const currentSets = ae?.sets ?? []
    const lastSet = currentSets.at(-1)

    if (lastSet) {
      // 2세트 이상: 직전 세트 기준 자동입력
      setWeightKg(String(Math.round(lastSet.weightKg)))
      setReps(String(lastSet.reps))
      setRpe(lastSet.rpe)
    } else {
      // 첫 세트: 이전 수행 기록에서 가져오기
      const cached = lastLogsRef.current.get(exercise.id)
      if (cached) {
        const prev = cached[0]
        setWeightKg(prev?.weight_kg != null ? String(Math.round(prev.weight_kg)) : "")
        setReps(prev?.reps != null ? String(prev.reps) : "")
        setRpe(7)
      } else {
        // 아직 캐시 없으면 API 호출
        setWeightKg("")
        setReps("")
        setRpe(7)
        getLastExerciseLog(exercise.id).then(({ sets }) => {
          lastLogsRef.current.set(exercise.id, sets)
          if (sets.length > 0 && activeExercises[currentIndex]?.sets.length === 0) {
            const prev = sets[0]
            if (prev.weight_kg != null) setWeightKg(String(Math.round(prev.weight_kg)))
            if (prev.reps != null) setReps(String(prev.reps))
          }
        }).catch(() => {})
      }
    }

    // 유산소/스트레칭 기존 값 복원
    setDurationMin(ae?.durationMin !== undefined ? String(Math.round(ae.durationMin)) : "")
    setDistanceKm(ae?.distanceKm !== undefined ? String(ae.distanceKm) : "")
    setSpeedKmh(ae?.speedKmh !== undefined ? String(ae.speedKmh) : "")
    setInclinePct(ae?.inclinePct !== undefined ? String(ae.inclinePct) : "")
    setCardioSaved(ae?.durationMin !== undefined)
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentExercise = currentExercises[currentIndex]
  const currentActive = activeExercises[currentIndex]

  function addSet() {
    const isBodyweight = currentExercise.type === "맨몸"
    const w = isBodyweight ? 0 : parseInt(weightKg)
    const r = parseInt(reps)
    if ((!isBodyweight && isNaN(w)) || isNaN(r) || r <= 0) return

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
    // 다음 세트 자동입력: 무게는 유지, 횟수는 유지
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
    const dur = parseInt(durationMin) || undefined
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

  // 완료 시 타이머 정리
  function handleComplete() {
    if (editMode) {
      onComplete(activeExercises, 0) // 부모(workout-edit)에서 duration 관리
      return
    }
    if (intervalRef.current) clearInterval(intervalRef.current)
    clearTimer()
    onComplete(activeExercises, elapsedSec)
  }


  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-24">
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
          <CardTitle className="text-base font-bold">{currentExercise.name}</CardTitle>
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
                    inputMode="numeric"
                    step="1"
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
                  inputMode="numeric"
                  step="1"
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
                {currentExercise.type !== "맨몸" && (
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-muted-foreground">무게 (kg)</label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      step="1"
                      placeholder="0"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-muted-foreground">횟수</label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    placeholder="0"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                  />
                </div>
              </div>

              <RpeSlider value={rpe} onChange={setRpe} />

              <div className="flex gap-2">
                <Button className="flex-1" onClick={addSet} disabled={currentExercise.type !== "맨몸" && (!weightKg || !reps) || currentExercise.type === "맨몸" && !reps}>
                  세트 기록
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
                    <div className={`grid text-[11px] font-medium text-muted-foreground ${currentExercise.type === "맨몸" ? "grid-cols-3" : "grid-cols-4"}`}>
                      <span>세트</span>
                      {currentExercise.type !== "맨몸" && <span className="text-right">무게</span>}
                      <span className="text-right">횟수</span>
                      <span className="text-right">RPE</span>
                    </div>
                    <Separator />
                    {currentActive.sets.map((set) => (
                      <div key={set.setNumber} className={`grid text-xs ${currentExercise.type === "맨몸" ? "grid-cols-3" : "grid-cols-4"}`}>
                        <span className="font-medium">{set.setNumber}</span>
                        {currentExercise.type !== "맨몸" && <span className="text-right">{Math.round(set.weightKg)}kg</span>}
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
            variant="secondary"
            className="flex-1"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            <ChevronLeft className="size-4" />
            이전
          </Button>
          <Button
            variant="secondary"
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
        <Button variant="secondary" className="w-24" onClick={onCancel}>
          취소
        </Button>
        <Button className="flex-1" onClick={handleComplete}>
          <CheckCircle2 />
          {editMode ? "수정 완료" : "운동 완료"}
        </Button>
      </div>

    </div>
  )
}
