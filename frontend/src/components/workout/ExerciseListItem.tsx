import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DIFFICULTY_KO, EQUIPMENT_LIST } from "@/lib/constants"
import type { Exercise } from "@/types"

const EQUIPMENT_SET = new Set<string>(EQUIPMENT_LIST)

interface ExerciseListItemProps {
  exercise: Exercise
  onClick?: () => void
  rightSlot?: React.ReactNode
  highlighted?: boolean
  className?: string
}

export function ExerciseListItem({
  exercise,
  onClick,
  rightSlot,
  highlighted = false,
  className,
}: ExerciseListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl p-3 text-left transition-colors",
        highlighted ? "border border-primary bg-primary/5" : "bg-card",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium">{exercise.name}</span>
        <span className="text-xs text-muted-foreground">
          {[
            exercise.muscle_group ?? exercise.type,
            exercise.equipment?.filter((e) => EQUIPMENT_SET.has(e)).join(", "),
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {exercise.difficulty && (
          <Badge variant="secondary">
            {DIFFICULTY_KO[exercise.difficulty] ?? exercise.difficulty}
          </Badge>
        )}
        {rightSlot}
      </div>
    </div>
  )
}
