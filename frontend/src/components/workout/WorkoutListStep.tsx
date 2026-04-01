import { useState } from "react"
import { Dumbbell, Zap, Timer, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { mockExercises } from "@/mocks"
import { formatDateKo, formatDuration } from "@/lib/date-utils"
import type { WorkoutSession } from "@/types"

function getExerciseName(exerciseId: string): string {
  return mockExercises.find((e) => e.id === exerciseId)?.nameKo ?? exerciseId
}

export function WorkoutListStep({
  userId,
  workouts,
}: {
  userId: string
  workouts: WorkoutSession[]
}) {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)

  const userWorkouts = workouts
    .filter((w) => w.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date))

  function toggleExpand(id: string) {
    setExpandedSessionId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-4">
      {/* 헤더 */}
      <h1 className="text-xl font-bold">Workout</h1>

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
            const uniqueExerciseIds = [...new Set(session.sets.map((s) => s.exerciseId))]
            const exerciseNames = uniqueExerciseIds.map(getExerciseName)
            const duration =
              session.startedAt && session.finishedAt
                ? formatDuration(session.startedAt, session.finishedAt)
                : null
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
                      <p className="text-xs text-muted-foreground truncate">
                        {exerciseNames.join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {session.overallRpe != null && (
                        <Badge variant="outline">RPE {session.overallRpe}</Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <Separator className="my-3" />

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

                  {/* 세부현황 (확장 시) */}
                  {isExpanded && (
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
          })}
        </div>
      )}
    </div>
  )
}
