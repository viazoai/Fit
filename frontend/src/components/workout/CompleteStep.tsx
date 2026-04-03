import { useState } from "react"
import { CheckCircle2, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatSeconds } from "@/lib/date-utils"
import type { Exercise, ActiveExercise } from "@/types"
import type { EarnResult } from "@/context/points-context"

export function CompleteStep({
  exercises,
  activeExercises,
  elapsedSec,
  onGoHome,
  onRestart,
  onSave,
}: {
  exercises: Exercise[]
  activeExercises: ActiveExercise[]
  elapsedSec: number
  onGoHome: () => void
  onRestart: () => void
  onSave: (memo: string) => EarnResult | null
}) {
  const [memo, setMemo] = useState("")
  const [saved, setSaved] = useState(false)
  const [earnResult, setEarnResult] = useState<EarnResult | null>(null)

  const totalSets = activeExercises.reduce((sum, ae) => sum + ae.sets.length, 0)
  const exerciseCount = activeExercises.filter((ae) => ae.sets.length > 0).length

  function handleSaveAndGo() {
    if (!saved) {
      const result = onSave(memo)
      setSaved(true)
      setEarnResult(result)
    }
    onGoHome()
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-24">
      {/* 헤더 */}
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="size-14 text-primary" />
        <h2 className="text-2xl font-bold">운동 완료!</h2>
        <p className="text-sm text-muted-foreground">오늘도 수고했어요 💪</p>
      </div>

      {/* 요약 카드 */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 divide-x text-center">
            <div className="flex flex-col gap-0.5 pr-4">
              <span className="text-lg font-bold">{formatSeconds(elapsedSec)}</span>
              <span className="text-xs text-muted-foreground">운동 시간</span>
            </div>
            <div className="flex flex-col gap-0.5 px-4">
              <span className="text-lg font-bold">{totalSets}</span>
              <span className="text-xs text-muted-foreground">총 세트</span>
            </div>
            <div className="flex flex-col gap-0.5 pl-4">
              <span className="text-lg font-bold">{exerciseCount}</span>
              <span className="text-xs text-muted-foreground">종목 수</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 종목별 요약 */}
      {activeExercises.filter((ae) => ae.sets.length > 0).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">종목별 기록</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {activeExercises
              .filter((ae) => ae.sets.length > 0)
              .map((ae) => {
                const exercise = exercises.find((e) => e.id === ae.exerciseId)
                const maxWeight = Math.max(...ae.sets.map((s) => s.weightKg))
                return (
                  <div key={ae.exerciseId} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{exercise?.name ?? `#${ae.exerciseId}`}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{ae.sets.length}세트</span>
                      {maxWeight > 0 && <span>최대 {maxWeight}kg</span>}
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}

      {/* 포인트 획득 카드 (저장 후 표시) */}
      {saved && earnResult && earnResult.totalEarned > 0 && (
        <Card className="border-primary/30 bg-primary/5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="size-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                +{earnResult.totalEarned.toLocaleString()}P 획득!
              </span>
            </div>
            <div className="space-y-0.5">
              {earnResult.breakdown.map(({ reason, amount }) => (
                <div key={reason} className="flex justify-between text-xs text-muted-foreground">
                  <span>{reason}</span>
                  <span className="font-medium text-primary">+{amount}P</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {saved && (!earnResult || earnResult.totalEarned === 0) && (
        <p className="text-xs text-center text-muted-foreground">
          오늘은 이미 포인트를 받았어요 (하루 1회)
        </p>
      )}

      {/* 메모 */}
      {!saved && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">메모 (선택)</label>
          <Input
            placeholder="오늘 운동 메모를 남겨보세요..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 flex flex-col gap-2 px-4">
        <Button className="w-full" onClick={handleSaveAndGo}>
          {saved ? "홈으로 가기" : "저장하고 홈으로"}
        </Button>
        <Button variant="outline" className="w-full" onClick={onRestart}>
          다시 기록하기
        </Button>
      </div>
    </div>
  )
}
