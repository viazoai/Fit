import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Flame, List, CalendarDays, Dumbbell, Zap, ChevronDown, ChevronUp, Clock, Pencil, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/context/user-context"
import { useWorkouts } from "@/context/workout-context"
import { WEEKDAY_LABELS } from "@/lib/constants"
import { getToday, formatDateKo } from "@/lib/date-utils"
import { WeeklyProgressCard } from "@/components/workout/WeeklyProgressCard"
import { getWorkout, getCalendar } from "@/lib/api"
import type { WorkoutSessionSummary, WorkoutSessionRead, CalendarDay } from "@/types"


// ─── 달력 유틸 ───────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}


// ─── 운동 세션 카드 (리스트/캘린더 모드 공유) ─────────────────────────────────

function WorkoutSummaryCard({
  summary,
  titleOverride,
}: {
  summary: WorkoutSessionSummary
  titleOverride?: string
}) {
  const navigate = useNavigate()
  const { removeWorkout } = useWorkouts()
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<WorkoutSessionRead | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleToggle() {
    const next = !expanded
    setExpanded(next)
    if (next && !detail) {
      try {
        const d = await getWorkout(summary.id)
        setDetail(d)
      } catch (err) {
        console.error("세션 상세 로드 실패:", err)
      }
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await removeWorkout(summary.id)
    } catch (err) {
      console.error("삭제 실패:", err)
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/30"
      onClick={handleToggle}
    >
      <CardContent className="py-2 px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-sm font-semibold">
              {titleOverride ?? formatDateKo(summary.date)}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {summary.muscle_groups.join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {summary.duration_min != null && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {summary.duration_min < 60
                  ? `${summary.duration_min}m`
                  : `${Math.floor(summary.duration_min / 60)}h ${summary.duration_min % 60}m`}
              </span>
            )}
            {expanded ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </div>
        </div>

        <Separator className="my-1" />

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Dumbbell className="size-3" />
            {summary.exercise_count}종목
          </span>
          {summary.kcal != null && (
            <span className="flex items-center gap-1">
              <Zap className="size-3" />
              {summary.kcal}kcal
            </span>
          )}
        </div>

        {summary.memo && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 italic">
            "{summary.memo}"
          </p>
        )}

        {expanded && detail && (
          <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
            <Separator />
            {detail.exercise_logs.map((log) => {
              const isCardio = log.exercise_type === "유산소"
              const isStretching = log.exercise_type === "스트레칭"

              return (
                <div key={log.id}>
                  <p className="text-xs font-semibold mb-1.5">
                    {log.exercise_name ?? `운동 #${log.exercise_id}`}
                  </p>

                  {isCardio && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      {log.duration_min != null && (
                        <>
                          <span className="text-muted-foreground">시간</span>
                          <span className="text-right">{Math.round(log.duration_min!)}분</span>
                        </>
                      )}
                      {log.distance_km != null && (
                        <>
                          <span className="text-muted-foreground">거리</span>
                          <span className="text-right">{Number(log.distance_km).toFixed(1)}km</span>
                        </>
                      )}
                      {log.speed_kmh != null && (
                        <>
                          <span className="text-muted-foreground">속도</span>
                          <span className="text-right">{log.speed_kmh}km/h</span>
                        </>
                      )}
                      {log.incline_pct != null && (
                        <>
                          <span className="text-muted-foreground">경사</span>
                          <span className="text-right">{log.incline_pct}%</span>
                        </>
                      )}
                      {log.duration_min == null && log.distance_km == null && (
                        <span className="text-muted-foreground col-span-2">기록 없음</span>
                      )}
                    </div>
                  )}

                  {isStretching && (
                    <div className="grid grid-cols-2 gap-x-3 text-xs">
                      <span className="text-muted-foreground">시간</span>
                      <span className="text-right">
                        {log.duration_min != null ? `${Math.round(log.duration_min)}분` : "-"}
                      </span>
                    </div>
                  )}

                  {!isCardio && !isStretching && (
                    <>
                      <div className="grid grid-cols-3 text-[11px] font-medium text-muted-foreground mb-1">
                        <span>세트</span>
                        <span className="text-right">무게</span>
                        <span className="text-right">횟수</span>
                      </div>
                      {log.sets.map((set) => (
                        <div key={set.id} className="grid grid-cols-3 text-xs">
                          <span>{set.set_index}</span>
                          <span className="text-right">
                            {set.weight_kg && set.weight_kg > 0 ? `${Math.round(set.weight_kg)}kg` : "-"}
                          </span>
                          <span className="text-right">{set.reps ?? "-"}회</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )
            })}
            <Separator />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={() => navigate(`/workout/${summary.id}/edit`)}
              >
                <Pencil className="size-3.5" />
                수정
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1 text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="size-3.5" />
                삭제
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>운동 기록을 삭제할까요?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">삭제하면 되돌릴 수 없어요.</p>
          <DialogFooter className="gap-2">
            <Button variant="secondary" className="w-24" onClick={() => setShowDeleteDialog(false)}>
              취소
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
              {deleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


// ─── 리스트 모드 ──────────────────────────────────────────────────────────────

function ListMode() {
  const { currentUser } = useCurrentUser()
  const { summaries } = useWorkouts()

  const userSummaries = summaries
    .filter((w) => w.user_id === currentUser.id)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      <WeeklyProgressCard />

      {userSummaries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Dumbbell className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            아직 운동 기록이 없어요.<br />Workout 탭에서 첫 운동을 시작해보세요!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {userSummaries.map((summary) => (
            <WorkoutSummaryCard key={summary.id} summary={summary} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 캘린더 모드 ─────────────────────────────────────────────────────────────

function CalendarMode() {
  const { currentUser } = useCurrentUser()
  const { summaries } = useWorkouts()

  const today = getToday()
  const todayDate = new Date(today)
  const [viewYear, setViewYear] = useState(todayDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())
  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  // 캘린더 API 호출
  useEffect(() => {
    async function load() {
      try {
        const res = await getCalendar(viewYear, viewMonth + 1) // API는 1-indexed month
        setCalendarDays(res.days)
      } catch (err) {
        console.error("캘린더 로드 실패:", err)
      }
    }
    load()
  }, [viewYear, viewMonth])

  // 스트릭 계산
  const myDates = summaries
    .filter((w) => w.user_id === currentUser.id)
    .map((w) => w.date)
    .sort((a, b) => b.localeCompare(a))
  let streak = 0
  {
    let checkMs = new Date(today).getTime()
    for (let i = 0; i < 365; i++) {
      const checkStr = new Date(checkMs).toISOString().split("T")[0]
      if (myDates.includes(checkStr)) {
        streak++
        checkMs -= 86400000
      } else {
        if (i === 0) { checkMs -= 86400000; continue }
        break
      }
    }
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDayOfWeek = getFirstDayOfMonth(viewYear, viewMonth)
  const calendarCells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)
  while (calendarCells.length < 42) calendarCells.push(null)

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }

  // 선택한 날짜의 운동 요약
  const selectedSummaries = summaries.filter((w) => w.date === selectedDate)

  // calendarDays lookup
  const dayMap = new Map(calendarDays.map((d) => [d.date, d]))

  return (
    <div className="space-y-4">
      {streak > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-accent-heat/10 border border-accent-heat/30 px-4 py-2.5">
          <Flame className="size-5 text-accent-heat shrink-0" />
          <p className="text-sm font-semibold text-accent-heat">
            {streak}일 연속 운동 중!
          </p>
        </div>
      )}

      <Card>
        <CardContent className="pt-4 space-y-3">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="size-8">
              <ChevronLeft className="size-4" />
            </Button>
            <h2 className="text-base font-semibold">{viewYear}년 {viewMonth + 1}월</h2>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="size-8">
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="text-xs font-medium text-muted-foreground py-1">
                {label}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarCells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />

              const dateStr = toDateStr(viewYear, viewMonth, day)
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate
              const calDay = dayMap.get(dateStr)
              const hasWorkout = calDay && calDay.session_count > 0

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1 rounded-lg transition-colors hover:bg-muted/60",
                    isSelected && !isToday && "ring-1 ring-primary"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-sm leading-none",
                      isToday && "bg-primary text-primary-foreground font-bold",
                      !isToday && isSelected && "font-semibold text-primary",
                      !isToday && !isSelected && "text-foreground"
                    )}
                  >
                    {day}
                  </span>
                  {/* 운동 표시 도트 */}
                  <div className="flex items-center gap-0.5 h-2">
                    {hasWorkout && (
                      <span className="size-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 선택 날짜 운동 기록 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground px-1">
          {(() => {
            const [, m, d] = selectedDate.split("-").map(Number)
            return `${m}월 ${d}일 운동 기록`
          })()}
        </h3>

        {selectedSummaries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">이 날은 운동 기록이 없어요</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedSummaries.map((summary) => (
              <WorkoutSummaryCard
                key={summary.id}
                summary={summary}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function LogPage() {
  const [mode, setMode] = useState<"list" | "calendar">("list")

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Log</h1>
        <button
          onClick={() => setMode((m) => (m === "list" ? "calendar" : "list"))}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            "border-border bg-background hover:bg-muted"
          )}
          aria-label={mode === "list" ? "캘린더 보기" : "리스트 보기"}
        >
          {mode === "list" ? (
            <><CalendarDays className="size-3.5" />캘린더</>
          ) : (
            <><List className="size-3.5" />리스트</>
          )}
        </button>
      </div>

      {mode === "list" ? <ListMode /> : <CalendarMode />}
    </div>
  )
}
