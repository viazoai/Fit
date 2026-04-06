import { Flame, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/context/user-context"
import { useWorkouts } from "@/context/workout-context"
import { getToday, getThisWeekDays } from "@/lib/date-utils"
import { WEEK_GOAL } from "@/lib/constants"

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"]

export function WeeklyProgressCard() {
  const { currentUser } = useCurrentUser()
  const { summaries } = useWorkouts()
  const today = getToday()
  const thisWeekDays = getThisWeekDays(today)

  const myWorkoutsThisWeek = thisWeekDays.filter((day) =>
    summaries.some((w) => w.user_id === currentUser.id && w.date === day)
  )
  const weekProgress = Math.min(
    Math.round((myWorkoutsThisWeek.length / WEEK_GOAL) * 100),
    100
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-foreground" />
          <CardTitle className="text-base">이번 주 현황</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          이번 주{" "}
          <span className="font-semibold text-foreground">
            {myWorkoutsThisWeek.length}회
          </span>{" "}
          운동 · 목표{" "}
          <span className="font-semibold text-foreground">{WEEK_GOAL}회</span>
        </p>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium">진행률</span>
          <span className="text-muted-foreground tabular-nums">{weekProgress}%</span>
        </div>
        <Progress value={weekProgress} />
        <div className="flex items-center justify-between pt-1">
          {thisWeekDays.map((day, i) => {
            const worked = summaries.some(
              (w) => w.user_id === currentUser.id && w.date === day
            )
            const isToday = day === today
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <Flame
                  className={cn(
                    "size-4 transition-colors",
                    worked ? "text-accent-heat" : "text-muted/50"
                  )}
                />
                <span
                  className={cn(
                    "text-xs",
                    isToday ? "font-bold text-primary" : "text-muted-foreground"
                  )}
                >
                  {WEEKDAY_LABELS[i]}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
