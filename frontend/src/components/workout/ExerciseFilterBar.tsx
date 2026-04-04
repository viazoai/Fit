import { FilterChip } from "./FilterChip"
import { MUSCLE_GROUPS } from "@/lib/constants"

interface ExerciseFilterBarProps {
  typeFilter: string
  setTypeFilter: (v: string) => void
  muscleFilter: string
  setMuscleFilter: (v: string) => void
  equipmentFilter: string
  setEquipmentFilter: (v: string) => void
  exerciseTypes: string[]
  equipmentTypes: string[]
}

export function ExerciseFilterBar({
  typeFilter,
  setTypeFilter,
  muscleFilter,
  setMuscleFilter,
  equipmentFilter,
  setEquipmentFilter,
  exerciseTypes,
  equipmentTypes,
}: ExerciseFilterBarProps) {
  const visibleEquipment = equipmentTypes.filter((eq) => eq !== "없음")

  return (
    <div className="flex flex-col gap-1.5">
      {/* 운동 구분 필터 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        <span className="shrink-0 text-xs font-semibold text-muted-foreground mr-1">구분</span>
        <FilterChip active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
          전체
        </FilterChip>
        {exerciseTypes.map((t) => (
          <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
            {t}
          </FilterChip>
        ))}
      </div>

      {/* 근육군 필터 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        <span className="shrink-0 text-xs font-semibold text-muted-foreground mr-1">부위</span>
        <FilterChip active={muscleFilter === "all"} onClick={() => setMuscleFilter("all")}>
          전체
        </FilterChip>
        {MUSCLE_GROUPS.map((mg) => (
          <FilterChip key={mg} active={muscleFilter === mg} onClick={() => setMuscleFilter(mg)}>
            {mg}
          </FilterChip>
        ))}
      </div>

      {/* 기구 필터 */}
      {visibleEquipment.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <span className="shrink-0 text-xs font-semibold text-muted-foreground mr-1">기구</span>
          <FilterChip active={equipmentFilter === "all"} onClick={() => setEquipmentFilter("all")}>
            전체
          </FilterChip>
          {visibleEquipment.map((eq) => (
            <FilterChip key={eq} active={equipmentFilter === eq} onClick={() => setEquipmentFilter(eq)}>
              {eq}
            </FilterChip>
          ))}
        </div>
      )}
    </div>
  )
}
