import { useState } from "react"
import { Dumbbell, Zap, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateKo } from "@/lib/date-utils"
import type { WorkoutSessionSummary } from "@/types"

export function WorkoutListStep({
  userId,
  workouts,
}: {
  userId: number
  workouts: WorkoutSessionSummary[]
}) {
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null)

  const userWorkouts = workouts
    .filter((w) => w.user_id === userId)
    .sort((a, b) => b.date.localeCompare(a.date))

  function toggleExpand(id: number) {
    setExpandedSessionId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-4">
      {/* 헤더 */}
      <h1 className="text-2xl font-bold">Workout</h1>

      {/* 기록 목록 */}
      {userWorkouts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Dumbbell className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            아직 운동 기록이 없어요.<br />첫 운동을 시작해보세요!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {userWorkouts.map((session) => {
            const isExpanded = expandedSessionId === session.id

            return (
              <Card
                key={session.id}
                className="cursor-pointer transition-colors hover:bg-muted/30"
                onClick={() => toggleExpand(session.id)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-sm font-semibold">{formatDateKo(session.date)}</p>
                      {session.muscle_groups.length > 0 && (
                        <p className="text-xs text-muted-foreground truncate">
                          {session.muscle_groups.join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline">{session.exercise_count}종목</Badge>
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-3">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="size-3" />
                      {session.exercise_count}종목
                    </span>
                    {session.kcal != null && (
                      <span className="flex items-center gap-1">
                        <Zap className="size-3" />
                        {session.kcal}kcal
                      </span>
                    )}
                  </div>

                  {session.memo && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2 italic">
                      "{session.memo}"
                    </p>
                  )}

                  {/* 세부현황 (확장 시) */}
                  {isExpanded && session.muscle_groups.length > 0 && (
                    <div className="mt-3 space-y-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1.5">
                        {session.muscle_groups.map((mg) => (
                          <Badge key={mg} variant="secondary" className="text-xs">
                            {mg}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
