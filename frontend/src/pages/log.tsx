import { useState } from "react"
import { ChevronLeft, ChevronRight, Flame, List, CalendarDays, TrendingUp, Dumbbell, Zap, Timer, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/context/user-context"
import { useWorkouts } from "@/context/workout-context"
import { mockExercises, mockUsers } from "@/mocks"
import { WEEKDAY_LABELS, WEEK_GOAL } from "@/lib/constants"
import { getToday, getThisWeekDays, formatDateKo, formatDuration, calcStreak } from "@/lib/date-utils"
import type { WorkoutSession } from "@/types"

const WEEKDAY_LABELS_MON = ["월", "화", "수", "목", "금", "토", "일"]

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


function getExerciseName(id: string) {
  return mockExercises.find((e) => e.id === id)?.nameKo ?? id
}

// ─── 운동 세션 카드 (리스트/캘린더 모드 공유) ─────────────────────────────────

function WorkoutSessionCard({
  session,
  titleOverride,
}: {
  session: WorkoutSession
  titleOverride?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const uniqueExerciseIds = [...new Set(session.sets.map((s) => s.exerciseId))]
  const exerciseNames = uniqueExerciseIds.map(getExerciseName)
  const duration =
    session.startedAt && session.finishedAt
      ? formatDuration(session.startedAt, session.finishedAt)
      : null

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/30"
      onClick={() => setExpanded((v) => !v)}
    >
      <CardContent className="py-2 px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-sm font-semibold">
              {titleOverride ?? formatDateKo(session.date)}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {exerciseNames.join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {session.overallRpe != null && (
              <span className="text-xs text-muted-foreground">RPE {session.overallRpe}</span>
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

        {expanded && (
          <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
            <Separator />
            {uniqueExerciseIds.map((exId) => {
              const name = getExerciseName(exId)
              const sets = session.sets.filter((s) => s.exerciseId === exId)
              return (
                <div key={exId}>
                  <p className="text-xs font-semibold mb-1.5">{name}</p>
                  <div className="grid grid-cols-3 text-[11px] font-medium text-muted-foreground mb-1">
                    <span>세트</span>
                    <span className="text-right">무게</span>
                    <span className="text-right">횟수</span>
                  </div>
                  {sets.map((set) => (
                    <div key={set.id} className="grid grid-cols-3 text-xs">
                      <span>{set.setNumber}</span>
                      <span className="text-right">
                        {set.weightKg > 0 ? `${set.weightKg}kg` : "-"}
                      </span>
                      <span className="text-right">{set.reps}회</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── 이번 주 현황 카드 ────────────────────────────────────────────────────────

function WeeklyProgressCard() {
  const { currentUser } = useCurrentUser()
  const { workouts } = useWorkouts()
  const today = getToday()
  const thisWeekDays = getThisWeekDays(today)

  const myWorkoutsThisWeek = thisWeekDays.filter((day) =>
    workouts.some((w) => w.userId === currentUser.id && w.date === day)
  )
  const weekProgress = Math.min(
    Math.round((myWorkoutsThisWeek.length / WEEK_GOAL) * 100),
    100
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <CardTitle className="text-base">이번 주 현황</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          이번 주{" "}
          <span className="font-semibold text-foreground">{myWorkoutsThisWeek.length}회</span>
          {" "}운동 · 목표{" "}
          <span className="font-semibold text-foreground">{WEEK_GOAL}회</span>
        </p>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium">진행률</span>
          <span className="text-muted-foreground tabular-nums">{weekProgress}%</span>
        </div>
        <Progress value={weekProgress} />
        <div className="flex items-center justify-between pt-1">
          {thisWeekDays.map((day, i) => {
            const worked = workouts.some(
              (w) => w.userId === currentUser.id && w.date === day
            )
            const isToday = day === today
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "size-3 rounded-full transition-colors",
                    worked ? "bg-primary" : "bg-muted"
                  )}
                />
                <span
                  className={cn(
                    "text-xs",
                    isToday ? "font-bold text-primary" : "text-muted-foreground"
                  )}
                >
                  {WEEKDAY_LABELS_MON[i]}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── 리스트 모드 ──────────────────────────────────────────────────────────────

function ListMode() {
  const { currentUser } = useCurrentUser()
  const { workouts } = useWorkouts()

  const userWorkouts = workouts
    .filter((w) => w.userId === currentUser.id)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      <WeeklyProgressCard />

      {userWorkouts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Dumbbell className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            아직 운동 기록이 없어요.<br />Workout 탭에서 첫 운동을 시작해보세요!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {userWorkouts.map((session) => (
            <WorkoutSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 캘린더 모드 ─────────────────────────────────────────────────────────────

function CalendarMode() {
  const { currentUser } = useCurrentUser()
  const { workouts } = useWorkouts()

  const today = getToday()
  const todayDate = new Date(today)
  const [viewYear, setViewYear] = useState(todayDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth())
  const [selectedDate, setSelectedDate] = useState<string>(today)

  const streak = calcStreak(currentUser.id, today, workouts)

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

  const selectedWorkouts = workouts.filter((w) => w.date === selectedDate)

  // 사용자 닉네임 첫 글자 (캘린더 셀에 표시)
  const user1 = mockUsers.find((u) => u.id === "user-1")
  const user2 = mockUsers.find((u) => u.id === "user-2")

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
              const user1Worked = workouts.some((w) => w.userId === "user-1" && w.date === dateStr)
              const user2Worked = workouts.some((w) => w.userId === "user-2" && w.date === dateStr)

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
                  {/* 이름 표시 */}
                  <div className="flex items-center gap-0.5 h-3.5">
                    {user1Worked && (
                      <span className="text-[9px] font-medium text-primary leading-none">
                        {user1?.nickname.slice(0, 1)}
                      </span>
                    )}
                    {user2Worked && (
                      <span className="text-[9px] font-medium text-chart-2 leading-none">
                        {user2?.nickname.slice(0, 1)}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* 범례 */}
          <div className="flex items-center gap-4 pt-1 justify-end">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">{user1?.nickname}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-2" />
              <span className="text-xs text-muted-foreground">{user2?.nickname}</span>
            </div>
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

        {selectedWorkouts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">이 날은 운동 기록이 없어요</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedWorkouts.map((session) => {
              const user = mockUsers.find((u) => u.id === session.userId)
              return (
                <WorkoutSessionCard
                  key={session.id}
                  session={session}
                  titleOverride={user?.nickname}
                />
              )
            })}
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
        <h1 className="text-xl font-bold">Log</h1>
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
