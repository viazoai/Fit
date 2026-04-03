import { useState } from "react"
import { Search, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useExercises } from "@/context/exercise-context"
import { MUSCLE_GROUPS, DIFFICULTY_KO } from "@/lib/constants"
import type { Exercise } from "@/types"

type FilterChipProps = {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 h-7 rounded-full px-3 text-xs font-medium border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground border-border hover:bg-muted"
      )}
    >
      {children}
    </button>
  )
}

export function SelectExercisesStep({
  onConfirm,
  onCancel,
  excludeIds,
}: {
  onConfirm: (exercises: Exercise[]) => void
  onCancel?: () => void
  excludeIds?: Set<number>
}) {
  const { exercises: allExercises } = useExercises()
  const [search, setSearch] = useState("")
  const [muscleFilter, setMuscleFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [equipmentFilter, setEquipmentFilter] = useState<string>("all")
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const isAddMode = !!onCancel

  // 운동 타입 / 장비 목록을 데이터에서 동적 추출
  const exerciseTypes = [...new Set(allExercises.map((e) => e.type))].sort()
  const equipmentTypes = [...new Set(
    allExercises.flatMap((e) => e.equipment ?? [])
  )].sort()

  const filtered = allExercises.filter((e) => {
    if (excludeIds?.has(e.id)) return false
    if (muscleFilter !== "all" && e.muscle_group !== muscleFilter) return false
    if (typeFilter !== "all" && e.type !== typeFilter) return false
    if (equipmentFilter !== "all" && !e.equipment?.includes(equipmentFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      if (!e.name.toLowerCase().includes(q)) return false
    }
    return true
  })

  // 운동 구분(타입)별 그룹핑
  const TYPE_ORDER = ["기구", "맨몸", "유산소", "스트레칭"]
  const grouped = TYPE_ORDER.map((t) => ({
    group: t,
    exercises: filtered.filter((e) => e.type === t),
  })).filter((g) => g.exercises.length > 0)

  const ungrouped = filtered.filter((e) => !TYPE_ORDER.includes(e.type))
  if (ungrouped.length > 0) {
    grouped.push({ group: "기타", exercises: ungrouped })
  }

  function toggleExercise(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleConfirm() {
    const exercises = allExercises.filter((e) => selected.has(e.id))
    onConfirm(exercises)
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-24">
      <h1 className="text-xl font-bold">Workout</h1>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="운동 이름 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* 운동 구분 필터 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        <span className="shrink-0 text-xs font-semibold text-muted-foreground mr-1">구분</span>
        <FilterChip active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
          전체
        </FilterChip>
        {exerciseTypes.filter((t) => t !== "맨몸").map((t) => (
          <FilterChip
            key={t}
            active={typeFilter === t}
            onClick={() => setTypeFilter(t)}
          >
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
          <FilterChip
            key={mg}
            active={muscleFilter === mg}
            onClick={() => setMuscleFilter(mg)}
          >
            {mg}
          </FilterChip>
        ))}
      </div>

      {/* 기구 필터 */}
      {equipmentTypes.filter((eq) => eq !== "없음").length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <span className="shrink-0 text-xs font-semibold text-muted-foreground mr-1">기구</span>
          <FilterChip active={equipmentFilter === "all"} onClick={() => setEquipmentFilter("all")}>
            전체
          </FilterChip>
          {equipmentTypes.filter((eq) => eq !== "없음").map((eq) => (
            <FilterChip
              key={eq}
              active={equipmentFilter === eq}
              onClick={() => setEquipmentFilter(eq)}
            >
              {eq}
            </FilterChip>
          ))}
        </div>
      )}

      {/* 운동 목록 */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
        ) : (
          grouped.map(({ group, exercises }) => (
            <div key={group} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground px-1">
                {group}
              </p>
              {exercises.map((exercise) => {
                const isSelected = selected.has(exercise.id)
                return (
                  <button
                    key={exercise.id}
                    onClick={() => toggleExercise(exercise.id)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-3 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium">{exercise.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {exercise.muscle_group ?? exercise.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {exercise.difficulty && (
                        <Badge variant="secondary">
                          {DIFFICULTY_KO[exercise.difficulty] ?? exercise.difficulty}
                        </Badge>
                      )}
                      {isSelected && <CheckCircle2 className="size-4 text-primary" />}
                    </div>
                  </button>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 flex gap-2 px-4">
        {isAddMode && (
          <Button variant="outline" className="w-24 h-10" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button className="flex-1 h-10" disabled={selected.size === 0} onClick={handleConfirm}>
          {selected.size > 0
            ? `${selected.size}개 선택 → ${isAddMode ? "운동 추가" : "운동 시작"}`
            : isAddMode ? "운동을 추가하세요" : "운동을 선택하세요"}
        </Button>
      </div>
    </div>
  )
}
