import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, ExternalLink, ChevronLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { useExercises } from "@/context/exercise-context"
import { MUSCLE_GROUPS, DIFFICULTY_KO, DIFFICULTY_VARIANT } from "@/lib/constants"
import type { Exercise, MuscleGroup } from "@/types"

type FilterMuscle = MuscleGroup | "all"

const FILTER_TABS: { value: FilterMuscle; label: string }[] = [
  { value: "all", label: "전체" },
  ...MUSCLE_GROUPS.map((mg) => ({ value: mg as FilterMuscle, label: mg })),
]

export default function LibraryPage() {
  const navigate = useNavigate()
  const { exercises: allExercises } = useExercises()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMuscle, setSelectedMuscle] = useState<FilterMuscle>("all")
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const filtered = allExercises.filter((ex) => {
    const matchesMuscle = selectedMuscle === "all" || ex.muscle_group === selectedMuscle
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch = !query || ex.name.toLowerCase().includes(query)
    return matchesMuscle && matchesSearch
  })

  return (
    <div className="flex flex-col h-full">
      {/* 검색 + 필터 */}
      <div className="px-4 pt-4 pb-2 space-y-3">
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-xl font-bold">운동 라이브러리</h1>
        </div>

        {/* 검색 Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="운동 이름 검색"
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="검색어 지우기"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* 근육군 필터 탭 */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedMuscle(tab.value)}
              className={[
                "shrink-0 h-8 rounded-lg px-3 text-sm font-medium transition-colors whitespace-nowrap",
                selectedMuscle === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 개수 */}
      <div className="px-4 pb-2">
        <p className="text-xs text-muted-foreground">{filtered.length}개의 운동</p>
      </div>

      {/* 운동 카드 목록 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="size-10 text-muted-foreground mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">검색 결과가 없어요</p>
            <p className="text-xs text-muted-foreground mt-1">다른 검색어나 부위를 선택해보세요</p>
          </div>
        ) : (
          filtered.map((exercise) => (
            <Card
              key={exercise.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedExercise(exercise)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight">{exercise.name}</p>

                    {/* 배지 */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {exercise.muscle_group && (
                        <Badge variant="secondary" className="text-xs">
                          {exercise.muscle_group}
                        </Badge>
                      )}
                      {exercise.difficulty && (
                        <Badge variant={DIFFICULTY_VARIANT[exercise.difficulty] ?? "secondary"} className="text-xs">
                          {DIFFICULTY_KO[exercise.difficulty] ?? exercise.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 타입 */}
                  <div className="shrink-0 text-right">
                    <span className="text-xs text-muted-foreground">
                      {exercise.type}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 운동 상세 모달 */}
      <Dialog
        open={!!selectedExercise}
        onOpenChange={(open) => { if (!open) setSelectedExercise(null) }}
      >
        {selectedExercise && (
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedExercise.name}</DialogTitle>
              <DialogDescription>{selectedExercise.type}</DialogDescription>
            </DialogHeader>

            {/* 배지 */}
            <div className="flex flex-wrap gap-2">
              {selectedExercise.muscle_group && (
                <Badge variant="secondary">
                  {selectedExercise.muscle_group}
                </Badge>
              )}
              {selectedExercise.difficulty && (
                <Badge variant={DIFFICULTY_VARIANT[selectedExercise.difficulty] ?? "secondary"}>
                  {DIFFICULTY_KO[selectedExercise.difficulty] ?? selectedExercise.difficulty}
                </Badge>
              )}
              {selectedExercise.equipment && selectedExercise.equipment.length > 0 && (
                selectedExercise.equipment.map((eq) => (
                  <span key={eq} className="inline-flex items-center h-5 px-2 text-xs text-muted-foreground bg-muted rounded-full">
                    {eq}
                  </span>
                ))
              )}
            </div>

            <Separator />

            {/* MET */}
            {selectedExercise.met_value != null && (
              <div className="flex gap-2">
                <span className="text-xs font-medium text-muted-foreground w-14 shrink-0">MET</span>
                <span className="text-sm">{String(selectedExercise.met_value)}</span>
              </div>
            )}

            {/* YouTube 링크 */}
            {selectedExercise.youtube_url && (
              <div>
                <a
                  href={selectedExercise.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary font-medium"
                >
                  <ExternalLink className="size-4" />
                  YouTube에서 보기
                </a>
              </div>
            )}

            <DialogFooter>
              <DialogClose render={<Button variant="outline" className="w-full" />}>
                닫기
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
