import { useState } from "react"
import { Search, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useExercises } from "@/context/exercise-context"
import { EQUIPMENT_LIST } from "@/lib/constants"


const EQUIPMENT_SET = new Set<string>(EQUIPMENT_LIST)
import { ExerciseFilterBar } from "./ExerciseFilterBar"
import { ExerciseListItem } from "./ExerciseListItem"
import type { Exercise } from "@/types"

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
  const [muscleFilter, setMuscleFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [equipmentFilter, setEquipmentFilter] = useState("all")
  const isAddMode = !!onCancel

  const [selected, setSelected] = useState<Set<number>>(() => {
    // 운동 추가 모드에서는 이전 기록 무시, 첫 선택 시에만 복원
    if (isAddMode) return new Set()
    try {
      const raw = localStorage.getItem("fit-last-exercises")
      return raw ? new Set<number>(JSON.parse(raw) as number[]) : new Set()
    } catch {
      return new Set()
    }
  })

  const exerciseTypes = [...new Set(allExercises.map((e) => e.type))].sort()
  const equipmentTypes = [...new Set(allExercises.flatMap((e) => (e.equipment ?? []).filter((eq) => EQUIPMENT_SET.has(eq))))].sort()

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
    // 마지막 선택 종목 저장 (추가 모드에서는 저장 안 함)
    if (!isAddMode) {
      localStorage.setItem("fit-last-exercises", JSON.stringify([...selected]))
    }
    onConfirm(exercises)
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-24">
      <h1 className="text-2xl font-bold">Workout</h1>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="운동 이름 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 border-border"
        />
      </div>

      <ExerciseFilterBar
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        muscleFilter={muscleFilter}
        setMuscleFilter={setMuscleFilter}
        equipmentFilter={equipmentFilter}
        setEquipmentFilter={setEquipmentFilter}
        exerciseTypes={exerciseTypes}
        equipmentTypes={equipmentTypes}
      />

      {/* 개수 */}
      <p className="text-xs text-muted-foreground">{filtered.length}개의 운동</p>

      {/* 운동 목록 */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
        ) : (
          grouped.map(({ group, exercises }) => (
            <div key={group} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground px-1">{group}</p>
              {exercises.map((exercise) => {
                const isSelected = selected.has(exercise.id)
                return (
                  <ExerciseListItem
                    key={exercise.id}
                    exercise={exercise}
                    onClick={() => toggleExercise(exercise.id)}
                    highlighted={isSelected}
                    rightSlot={isSelected ? <CheckCircle2 className="size-4 text-primary" /> : undefined}
                  />
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 flex gap-2 px-4">
        {isAddMode && (
          <Button variant="secondary" className="w-24" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button className="flex-1" disabled={selected.size === 0} onClick={handleConfirm}>
          {selected.size > 0
            ? `${selected.size}개 선택 → ${isAddMode ? "운동 추가" : "운동 시작"}`
            : isAddMode
              ? "운동을 추가하세요"
              : "운동을 선택하세요"}
        </Button>
      </div>
    </div>
  )
}
