import { useState } from "react"
import { ChevronLeft, ChevronRight, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/context/user-context"
import { useWorkouts } from "@/context/workout-context"
import { mockUsers } from "@/mocks"
import { WEEKDAY_LABELS } from "@/lib/constants"
import { getToday } from "@/lib/date-utils"

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function toDateStr(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0")
  const d = String(day).padStart(2, "0")
  return `${year}-${m}-${d}`
}

function calcStreak(userId: number, today: string, allWorkouts: { user_id: number; date: string }[]): number {
  const dates = allWorkouts
    .filter((w) => w.user_id === userId)
    .map((w) => w.date)
    .sort((a, b) => b.localeCompare(a))

  if (dates.length === 0) return 0

  let streak = 0
  const todayMs = new Date(today).getTime()
  let checkMs = todayMs

  for (let i = 0; i < 365; i++) {
    const checkStr = new Date(checkMs).toISOString().split("T")[0]
    if (dates.includes(checkStr)) {
      streak++
      checkMs -= 24 * 60 * 60 * 1000
    } else {
      // 오늘 운동 없으면 어제부터 확인
      if (i === 0) {
        checkMs -= 24 * 60 * 60 * 1000
        continue
      }
      break
    }
  }

  return streak
}

export default function CalendarPage() {
  const { currentUser } = useCurrentUser()
  const { summaries } = useWorkouts()

  const today = getToday()
  const todayDate = new Date(today)
  const [viewYear, setViewYear] = useState(todayDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth()) // 0-indexed

  const [selectedDate, setSelectedDate] = useState<string>(today)

  const streak = calcStreak(currentUser.id, today, summaries)

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDayOfWeek = getFirstDayOfMonth(viewYear, viewMonth) // 0=일

  // 달력 그리드 (6주 = 42칸)
  const calendarCells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d)
  }
  while (calendarCells.length < 42) {
    calendarCells.push(null)
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  // 선택한 날짜의 운동 (user_id 1, 2 모두)
  const selectedWorkouts = selectedDate
    ? summaries.filter((w) => w.date === selectedDate)
    : []

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      <h1 className="text-[30px] font-bold">Calendar</h1>

      {/* 스트릭 배너 */}
      {streak > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-accent-heat/10 border border-accent-heat/30 px-4 py-2.5">
          <Flame className="size-5 text-accent-heat shrink-0" />
          <p className="text-sm font-semibold text-accent-heat">
            {streak}일 연속 운동 중!
          </p>
        </div>
      )}

      {/* 월간 캘린더 */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="size-8"
              aria-label="이전 달"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <h2 className="text-base font-semibold">
              {viewYear}년 {viewMonth + 1}월
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="size-8"
              aria-label="다음 달"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-xs font-medium text-muted-foreground py-1"
              >
                {label}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />
              }

              const dateStr = toDateStr(viewYear, viewMonth, day)
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate

              // 각 사용자 운동 여부
              const user1Worked = summaries.some(
                (w) => w.user_id === 1 && w.date === dateStr
              )
              const user2Worked = summaries.some(
                (w) => w.user_id === 2 && w.date === dateStr
              )

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1 rounded-lg transition-colors",
                    isSelected && !isToday && "ring-1 ring-primary",
                    "hover:bg-muted/60"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-sm leading-none",
                      isToday &&
                        "bg-primary text-primary-foreground font-bold",
                      !isToday && isSelected && "font-semibold text-primary",
                      !isToday &&
                        !isSelected &&
                        "text-foreground"
                    )}
                  >
                    {day}
                  </span>
                  {/* 운동 도트 */}
                  <div className="flex items-center gap-0.5 h-2">
                    {user1Worked && (
                      <span className="size-1.5 rounded-full bg-primary" />
                    )}
                    {user2Worked && (
                      <span className="size-1.5 rounded-full bg-chart-2" />
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
              <span className="text-xs text-muted-foreground">
                {mockUsers.find((u) => u.id === 1)?.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-2" />
              <span className="text-xs text-muted-foreground">
                {mockUsers.find((u) => u.id === 2)?.name}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 선택한 날짜 운동 요약 */}
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
              <p className="text-sm text-muted-foreground">
                이 날은 운동 기록이 없어요
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4 space-y-4">
              {selectedWorkouts.map((workout, idx) => {
                const user = mockUsers.find((u) => u.id === workout.user_id)

                return (
                  <div key={workout.id}>
                    {idx > 0 && <Separator className="mb-4" />}
                    <div className="flex items-start gap-3">
                      <Avatar name={user?.name ?? "?"} size="sm" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">
                            {user?.name ?? "알 수 없음"}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {workout.kcal && (
                              <span className="text-xs text-muted-foreground">
                                {workout.kcal} kcal
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs h-4">
                              {workout.exercise_count}종목
                            </Badge>
                          </div>
                        </div>

                        {/* 근육군 배지 */}
                        {workout.muscle_groups.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {workout.muscle_groups.map((mg) => (
                              <Badge
                                key={mg}
                                variant="secondary"
                                className="text-xs"
                              >
                                {mg}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {workout.memo && (
                          <p className="text-xs text-muted-foreground">
                            {workout.memo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
