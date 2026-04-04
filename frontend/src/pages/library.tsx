import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, ChevronLeft, Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { useExercises } from "@/context/exercise-context"
import { ExerciseFilterBar } from "@/components/workout/ExerciseFilterBar"
import { ExerciseListItem } from "@/components/workout/ExerciseListItem"
import { FilterChip } from "@/components/workout/FilterChip"
import { MUSCLE_GROUPS, DIFFICULTY_KO, EQUIPMENT_LIST } from "@/lib/constants"

const EQUIPMENT_SET = new Set<string>(EQUIPMENT_LIST)
import { createExercise, updateExercise, deleteExercise } from "@/lib/api"
import type { Exercise } from "@/types"

// ─── 운동 폼 상태 ─────────────────────────────────────────────────────────────

interface ExerciseFormState {
  name: string
  type: string
  muscle_group: string
  difficulty: string
  equipment: string[]
  youtube_url: string
  met_value: string
}

const EMPTY_FORM: ExerciseFormState = {
  name: "",
  type: "기구",
  muscle_group: "",
  difficulty: "",
  equipment: [],
  youtube_url: "",
  met_value: "",
}

function exerciseToForm(ex: Exercise): ExerciseFormState {
  return {
    name: ex.name,
    type: ex.type,
    muscle_group: ex.muscle_group ?? "",
    difficulty: ex.difficulty ?? "",
    equipment: ex.equipment ?? [],
    youtube_url: ex.youtube_url ?? "",
    met_value: ex.met_value != null ? String(ex.met_value) : "",
  }
}

// ─── 상세/편집/삭제 다이얼로그 ───────────────────────────────────────────────

type DialogMode = "detail" | "edit" | "delete-confirm"

interface ExerciseDialogProps {
  exercise: Exercise
  onClose: () => void
  onUpdated: () => Promise<void>
  onDeleted: () => Promise<void>
}

function ExerciseDialog({ exercise, onClose, onUpdated, onDeleted }: ExerciseDialogProps) {
  const [mode, setMode] = useState<DialogMode>("detail")
  const [form, setForm] = useState<ExerciseFormState>(exerciseToForm(exercise))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const EXERCISE_TYPES = ["기구", "맨몸", "유산소", "스트레칭"]
  const DIFFICULTIES = ["초급", "중급", "고급"]

  function toggleEquipment(eq: string) {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter((e) => e !== eq)
        : [...prev.equipment, eq],
    }))
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("운동 이름을 입력하세요"); return }
    if (!form.difficulty) { setError("난이도를 선택해주세요"); return }
    if (["기구", "맨몸"].includes(form.type) && !form.muscle_group) { setError("부위를 선택해주세요"); return }
    if (form.type === "기구" && form.equipment.length === 0) { setError("기구 운동은 기구를 하나 이상 선택해주세요"); return }
    setSaving(true)
    setError("")
    try {
      await updateExercise(exercise.id, {
        name: form.name.trim(),
        type: form.type,
        muscle_group: form.muscle_group || null,
        difficulty: form.difficulty || null,
        equipment: form.equipment.length > 0 ? form.equipment : null,
        youtube_url: form.youtube_url.trim() || null,
        met_value: form.met_value ? parseFloat(form.met_value) : null,
      })
      await onUpdated()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했어요")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await deleteExercise(exercise.id)
      await onDeleted()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했어요")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* 상세 보기 */}
      {mode === "detail" && (
        <>
          <DialogHeader>
            <DialogTitle className="pr-8 font-bold">{exercise.name}</DialogTitle>
          </DialogHeader>
          <button
            onClick={() => setMode("delete-confirm")}
            className="absolute top-3 right-3 p-1 text-destructive hover:opacity-70 transition-opacity"
            aria-label="삭제"
          >
            <Trash2 className="size-4" />
          </button>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-xs text-muted-foreground">구분</span>
              <Badge variant="secondary">{exercise.type}</Badge>
            </div>
            {exercise.muscle_group && (
              <div className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-xs text-muted-foreground">부위</span>
                <Badge variant="secondary">{exercise.muscle_group}</Badge>
              </div>
            )}
            {exercise.difficulty && (
              <div className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-xs text-muted-foreground">난이도</span>
                <Badge variant="secondary">{DIFFICULTY_KO[exercise.difficulty] ?? exercise.difficulty}</Badge>
              </div>
            )}
            {(() => {
              const validEquipment = exercise.equipment?.filter((e) => EQUIPMENT_SET.has(e)) ?? []
              return validEquipment.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="w-10 shrink-0 text-xs text-muted-foreground mt-0.5">기구</span>
                  <div className="flex flex-wrap gap-1">
                    {validEquipment.map((eq) => (
                      <Badge key={eq} variant="secondary">{eq}</Badge>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            {exercise.met_value != null && (
              <div className="flex gap-2">
                <span className="text-xs font-medium text-muted-foreground w-14 shrink-0">MET</span>
                <span className="text-sm">{String(exercise.met_value)}</span>
              </div>
            )}
            {exercise.youtube_url && (
              <a
                href={exercise.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium"
              >
                <ExternalLink className="size-4" />
                YouTube에서 보기
              </a>
            )}
          </div>

          <DialogFooter className="flex-row gap-2 sm:flex-row bg-transparent border-t-0 shadow-none mx-0 mt-0 mb-0 p-0">
            <DialogClose render={<Button variant="secondary" className="flex-1" />}>
              닫기
            </DialogClose>
            <Button className="flex-1" onClick={() => setMode("edit")}>
              <Pencil className="size-4 mr-1" />
              편집
            </Button>
          </DialogFooter>
        </>
      )}

      {/* 편집 폼 */}
      {mode === "edit" && (
        <>
          <DialogHeader>
            <DialogTitle className="font-bold">운동 편집</DialogTitle>
          </DialogHeader>

          <ExerciseForm
            form={form}
            setForm={setForm}
            exerciseTypes={EXERCISE_TYPES}
            difficulties={DIFFICULTIES}
            toggleEquipment={toggleEquipment}
            error={error}
          />

          <DialogFooter className="flex-row gap-2 sm:flex-row bg-transparent border-t-0 shadow-none mx-0 mt-0 mb-0 p-0">
            <Button variant="secondary" className="flex-1" onClick={() => { setForm(exerciseToForm(exercise)); setMode("detail") }}>
              취소
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </>
      )}

      {/* 삭제 확인 */}
      {mode === "delete-confirm" && (
        <div className="flex flex-col gap-3">
          <p className="text-base font-bold">운동 삭제</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{exercise.name}</span>을(를) 삭제할까요?<br />
            기존 기록은 유지되지만 이후 운동 선택 목록에서 사라져요.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setMode("detail")} disabled={saving}>
              취소
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={saving}>
              {saving ? "삭제 중..." : "삭제"}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

// ─── 운동 추가 다이얼로그 ──────────────────────────────────────────────────────

interface AddExerciseDialogProps {
  onClose: () => void
  onCreated: () => Promise<void>
}

function AddExerciseDialog({ onClose, onCreated }: AddExerciseDialogProps) {
  const [form, setForm] = useState<ExerciseFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const EXERCISE_TYPES = ["기구", "맨몸", "유산소", "스트레칭"]
  const DIFFICULTIES = ["초급", "중급", "고급"]

  function toggleEquipment(eq: string) {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter((e) => e !== eq)
        : [...prev.equipment, eq],
    }))
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("운동 이름을 입력하세요"); return }
    if (!form.difficulty) { setError("난이도를 선택해주세요"); return }
    if (["기구", "맨몸"].includes(form.type) && !form.muscle_group) { setError("부위를 선택해주세요"); return }
    if (form.type === "기구" && form.equipment.length === 0) { setError("기구 운동은 기구를 하나 이상 선택해주세요"); return }
    setSaving(true)
    setError("")
    try {
      await createExercise({
        name: form.name.trim(),
        type: form.type,
        muscle_group: form.muscle_group || null,
        difficulty: form.difficulty || null,
        equipment: form.equipment.length > 0 ? form.equipment : null,
        youtube_url: form.youtube_url.trim() || null,
        met_value: form.met_value ? parseFloat(form.met_value) : null,
      })
      await onCreated()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했어요")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-bold">운동 추가</DialogTitle>
      </DialogHeader>

      <ExerciseForm
        form={form}
        setForm={setForm}
        exerciseTypes={EXERCISE_TYPES}
        difficulties={DIFFICULTIES}
        toggleEquipment={toggleEquipment}
        error={error}
      />

      <DialogFooter className="flex-row gap-2 sm:flex-row bg-transparent border-t-0 shadow-none mx-0 mt-0 mb-0 p-0">
        <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
          취소
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "추가"}
        </Button>
      </DialogFooter>
    </>
  )
}

// ─── 공용 폼 컴포넌트 ──────────────────────────────────────────────────────────

interface ExerciseFormProps {
  form: ExerciseFormState
  setForm: React.Dispatch<React.SetStateAction<ExerciseFormState>>
  exerciseTypes: string[]
  difficulties: string[]
  toggleEquipment: (eq: string) => void
  error: string
}

function ExerciseForm({ form, setForm, exerciseTypes, difficulties, toggleEquipment, error }: ExerciseFormProps) {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
      {/* 이름 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">이름 *</label>
        <Input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="예: 벤치프레스"
          className="border-border"
        />
      </div>

      {/* 운동 구분 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">구분</label>
        <div className="flex flex-wrap gap-1.5">
          {exerciseTypes.map((t) => (
            <FilterChip key={t} active={form.type === t} onClick={() => setForm((p) => ({
                ...p,
                type: t,
                muscle_group: ["유산소", "스트레칭"].includes(t) ? "" : p.muscle_group,
                equipment: t !== "기구" ? [] : p.equipment,
              }))}>
              {t}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* 근육군 — 유산소/스트레칭은 제외 */}
      {!["유산소", "스트레칭"].includes(form.type) && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">부위 *</label>
          <div className="flex flex-wrap gap-1.5">
            {MUSCLE_GROUPS.map((mg) => (
              <FilterChip key={mg} active={form.muscle_group === mg} onClick={() => setForm((p) => ({ ...p, muscle_group: p.muscle_group === mg ? "" : mg }))}>
                {mg}
              </FilterChip>
            ))}
          </div>
        </div>
      )}

      {/* 난이도 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">난이도 *</label>
        <div className="flex flex-wrap gap-1.5">
          {difficulties.map((d) => (
            <FilterChip key={d} active={form.difficulty === d} onClick={() => setForm((p) => ({ ...p, difficulty: p.difficulty === d ? "" : d }))}>
              {d}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* 기구 — 구분이 "기구"일 때만 표시 */}
      {form.type === "기구" && (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">기구 *</label>
        <div className="flex flex-wrap gap-1.5">
          {EQUIPMENT_LIST.map((eq) => (
            <FilterChip key={eq} active={form.equipment.includes(eq)} onClick={() => toggleEquipment(eq)}>
              {eq}
            </FilterChip>
          ))}
        </div>
      </div>
      )}

      {/* YouTube URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">YouTube URL</label>
        <Input
          value={form.youtube_url}
          onChange={(e) => setForm((p) => ({ ...p, youtube_url: e.target.value }))}
          placeholder="https://youtube.com/..."
          className="border-border"
        />
      </div>

      {/* MET 값 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">MET 값</label>
        <Input
          type="number"
          value={form.met_value}
          onChange={(e) => setForm((p) => ({ ...p, met_value: e.target.value }))}
          placeholder="예: 5.0"
          className="border-border"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// ─── 메인 라이브러리 페이지 ───────────────────────────────────────────────────

const TYPE_ORDER = ["기구", "맨몸", "유산소", "스트레칭"]

export default function LibraryPage() {
  const navigate = useNavigate()
  const { exercises: allExercises, refresh } = useExercises()

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [muscleFilter, setMuscleFilter] = useState("all")
  const [equipmentFilter, setEquipmentFilter] = useState("all")

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const exerciseTypes = [...new Set(allExercises.map((e) => e.type))].sort()
  const equipmentTypes = [...new Set(allExercises.flatMap((e) => (e.equipment ?? []).filter((eq) => EQUIPMENT_SET.has(eq))))].sort()

  const filtered = allExercises.filter((ex) => {
    if (typeFilter !== "all" && ex.type !== typeFilter) return false
    if (muscleFilter !== "all" && ex.muscle_group !== muscleFilter) return false
    if (equipmentFilter !== "all" && !ex.equipment?.includes(equipmentFilter)) return false
    const query = search.trim().toLowerCase()
    if (query && !ex.name.toLowerCase().includes(query)) return false
    return true
  })

  const grouped = TYPE_ORDER.map((t) => ({
    group: t,
    exercises: filtered.filter((e) => e.type === t),
  })).filter((g) => g.exercises.length > 0)

  const ungrouped = filtered.filter((e) => !TYPE_ORDER.includes(e.type))
  if (ungrouped.length > 0) grouped.push({ group: "기타", exercises: ungrouped })

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-2xl font-bold">운동 라이브러리</h1>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="운동 이름 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 pr-8 border-border"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="size-10 text-muted-foreground mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">검색 결과가 없어요</p>
            <p className="text-xs text-muted-foreground mt-1">다른 검색어나 필터를 선택해보세요</p>
          </div>
        ) : (
          grouped.map(({ group, exercises }) => (
            <div key={group} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground px-1">{group}</p>
              {exercises.map((exercise) => (
                <ExerciseListItem
                  key={exercise.id}
                  exercise={exercise}
                  onClick={() => setSelectedExercise(exercise)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* 운동 상세/편집/삭제 다이얼로그 */}
      <Dialog
        open={!!selectedExercise}
        onOpenChange={(open) => { if (!open) setSelectedExercise(null) }}
      >
        {selectedExercise && (
          <DialogContent className="max-h-[85vh] overflow-y-auto" showCloseButton={false}>
            <ExerciseDialog
              exercise={selectedExercise}
              onClose={() => setSelectedExercise(null)}
              onUpdated={refresh}
              onDeleted={refresh}
            />
          </DialogContent>
        )}
      </Dialog>

      {/* 운동 추가 다이얼로그 */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) setAddOpen(false) }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto" showCloseButton={false}>
          <AddExerciseDialog
            onClose={() => setAddOpen(false)}
            onCreated={refresh}
          />
        </DialogContent>
      </Dialog>

      {/* 하단 고정 추가 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <Button className="w-full" onClick={() => setAddOpen(true)}>
          <Plus className="size-4 mr-1" />
          운동 추가
        </Button>
      </div>
    </div>
  )
}
