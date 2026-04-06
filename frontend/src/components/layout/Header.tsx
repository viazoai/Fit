import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Dumbbell, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/context/user-context"
import { useWorkouts } from "@/context/workout-context"
import { getToday } from "@/lib/date-utils"
import ProfilePopover from "@/components/layout/ProfilePopover"
import { getElapsedMs } from "@/lib/timer-storage"

function calcStreakFromSummaries(
  userId: number,
  today: string,
  summaries: { user_id: number; date: string }[],
): number {
  const dates = summaries
    .filter((w) => w.user_id === userId)
    .map((w) => w.date)
    .sort((a, b) => b.localeCompare(a))
  if (dates.length === 0) return 0
  let streak = 0
  let checkMs = new Date(today).getTime()
  for (let i = 0; i < 365; i++) {
    const checkStr = new Date(checkMs).toISOString().split("T")[0]
    if (dates.includes(checkStr)) {
      streak++
      checkMs -= 86400000
    } else {
      if (i === 0) { checkMs -= 86400000; continue }
      break
    }
  }
  return streak
}

interface HeaderProps {
  currentUserId?: number
  transparent?: boolean
}

function useElapsedTimer(active: boolean) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!active) { setElapsed(0); return }
    const tick = () => setElapsed(Math.floor(getElapsedMs() / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [active])

  return elapsed
}

function formatElapsed(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export default function Header({ transparent = false }: HeaderProps) {
  const { currentUser } = useCurrentUser()
  const { summaries, isWorkoutActive } = useWorkouts()
  const today = getToday()
  const streak = calcStreakFromSummaries(currentUser.id, today, summaries)
  const elapsed = useElapsedTimer(isWorkoutActive)

  return (
    <header
      className={cn(
        "h-14 sticky top-0 z-50",
        "flex items-center justify-between px-4",
        transparent ? "bg-transparent border-transparent" : "border-b border-border bg-background"
      )}
    >
      {/* 로고 */}
      <Link to="/" className="flex items-center gap-2">
        <Dumbbell className="size-6 text-primary" />
        <span className="text-lg font-bold tracking-tight">Fit</span>
      </Link>

      {/* 운동 중 타이머 */}
      {isWorkoutActive && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-semibold tabular-nums tracking-wide">
            {formatElapsed(elapsed)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* 스트릭 */}
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors",
            streak > 0 ? "bg-accent-heat/15" : "bg-muted/50"
          )}
        >
          <Flame
            className={cn(
              "size-5 transition-colors",
              streak > 0 ? "text-accent-heat" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              streak > 0 ? "text-accent-heat" : "text-muted-foreground"
            )}
          >
            {streak}일
          </span>
        </div>

        {/* 사용자 아바타 */}
        <ProfilePopover />
      </div>
    </header>
  )
}
