import { Link } from "react-router-dom"
import { Dumbbell, Flame } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { mockUsers } from "@/mocks"
import { cn } from "@/lib/utils"
import { useWorkouts } from "@/context/workout-context"
import { calcStreak, getToday } from "@/lib/date-utils"

interface HeaderProps {
  currentUserId?: string
  onUserSwitch?: () => void
}

export default function Header({ currentUserId = "user-1", onUserSwitch }: HeaderProps) {
  const currentUser = mockUsers.find((u) => u.id === currentUserId) ?? mockUsers[0]
  const { workouts } = useWorkouts()
  const today = getToday()
  const streak = calcStreak(currentUserId, today, workouts)

  return (
    <header
      className={cn(
        "h-14 sticky top-0 z-50",
        "flex items-center justify-between px-4",
        "border-b border-border bg-background"
      )}
    >
      {/* 로고 */}
      <Link to="/" className="flex items-center gap-2">
        <Dumbbell className="size-5 text-primary" />
        <span className="text-base font-bold tracking-tight">Fit</span>
      </Link>

      <div className="flex items-center gap-3">
        {/* 스트릭 */}
        <div className="flex items-center gap-1">
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

        {/* 사용자 아바타 (클릭 시 전환) */}
        <button
          type="button"
          onClick={onUserSwitch}
          aria-label={`현재 사용자: ${currentUser.nickname}. 클릭하여 전환`}
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar name={currentUser.nickname} size="sm" />
        </button>
      </div>
    </header>
  )
}
