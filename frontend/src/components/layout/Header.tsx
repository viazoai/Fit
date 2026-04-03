import { Link } from "react-router-dom"
import { Dumbbell, Flame } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/context/user-context"
import { useWorkouts } from "@/context/workout-context"
import { getToday } from "@/lib/date-utils"

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

export default function Header({ transparent = false }: HeaderProps) {
  const { currentUser } = useCurrentUser()
  const { summaries } = useWorkouts()
  const today = getToday()
  const streak = calcStreakFromSummaries(currentUser.id, today, summaries)

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
        <Dumbbell className="size-5 text-primary" />
        <span className="text-base font-bold tracking-tight">Fit</span>
      </Link>

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
              "size-4 transition-colors",
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
        <div className="rounded-full">
          <Avatar name={currentUser.name} size="sm" />
        </div>
      </div>
    </header>
  )
}
