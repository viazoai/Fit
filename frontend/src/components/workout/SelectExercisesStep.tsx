import { useState } from "react"
import { Search, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { mockExercises } from "@/mocks"
import {
  BODY_PART_KO,
  BODY_PARTS,
  EQUIPMENT_KO,
  EQUIPMENT_TYPES,
  DIFFICULTY_KO,
  DIFFICULTY_VARIANT,
} from "@/lib/constants"
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
}: {
  onConfirm: (exercises: Exercise[]) => void
}) {
  const [search, setSearch] = useState("")
  const [bodyPartFilter, setBodyPartFilter] = useState<string>("all")
  const [equipmentFilter, setEquipmentFilter] = useState<string>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = mockExercises.filter((e) => {
    if (bodyPartFilter !== "all" && e.bodyPart !== bodyPartFilter) return false
    if (equipmentFilter !== "all" && e.equipment !== equipmentFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !e.nameKo.includes(search) &&
        !e.nameEn.toLowerCase().includes(q) &&
        !e.primaryMuscle.includes(search)
      )
        return false
    }
    return true
  })

  // 부위별 그룹핑 (필터된 결과 기준)
  const groupedByBodyPart = BODY_PARTS.map((part) => ({
    part,
    exercises: filtered.filter((e) => e.bodyPart === part),
  })).filter((g) => g.exercises.length > 0)

  function toggleExercise(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleConfirm() {
    const exercises = mockExercises.filter((e) => selected.has(e.id))
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

      {/* 부위 필터 */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        <FilterChip active={bodyPartFilter === "all"} onClick={() => setBodyPartFilter("all")}>
          전체
        </FilterChip>
        {BODY_PARTS.map((part) => (
          <FilterChip
            key={part}
            active={bodyPartFilter === part}
            onClick={() => setBodyPartFilter(part)}
          >
            {BODY_PART_KO[part]}
          </FilterChip>
        ))}
      </div>

      {/* 기구 필터 */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        <FilterChip active={equipmentFilter === "all"} onClick={() => setEquipmentFilter("all")}>
          전체
        </FilterChip>
        {EQUIPMENT_TYPES.map((eq) => (
          <FilterChip
            key={eq}
            active={equipmentFilter === eq}
            onClick={() => setEquipmentFilter(eq)}
          >
            {EQUIPMENT_KO[eq] ?? eq}
          </FilterChip>
        ))}
      </div>

      {/* 운동 목록 */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
        ) : (
          groupedByBodyPart.map(({ part, exercises }) => (
            <div key={part} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground px-1">
                {BODY_PART_KO[part]}
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
                      <span className="text-sm font-medium">{exercise.nameKo}</span>
                      <span className="text-xs text-muted-foreground">{exercise.primaryMuscle}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge variant={DIFFICULTY_VARIANT[exercise.difficulty] ?? "secondary"}>
                        {DIFFICULTY_KO[exercise.difficulty] ?? exercise.difficulty}
                      </Badge>
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
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <Button className="w-full" disabled={selected.size === 0} onClick={handleConfirm}>
          {selected.size > 0 ? `${selected.size}개 선택 → 운동 시작` : "운동을 선택하세요"}
        </Button>
      </div>
    </div>
  )
}
