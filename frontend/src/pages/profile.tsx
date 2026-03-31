import { useState } from "react"
import { Check } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser } from "@/context/user-context"

const EQUIPMENT_LIST = [
  { value: "barbell", label: "바벨" },
  { value: "dumbbell", label: "덤벨" },
  { value: "cable", label: "케이블" },
  { value: "machine", label: "머신" },
  { value: "bodyweight", label: "맨몸" },
  { value: "pull-up bar", label: "철봉" },
]

const FITNESS_GOALS = [
  "근력 향상",
  "체지방 감소",
  "근육량 증가",
  "체력 향상",
  "유지",
]

const GENDER_KO: Record<string, string> = {
  male: "남성",
  female: "여성",
}

export default function ProfilePage() {
  const { currentUser, partner } = useCurrentUser()

  // 운동 목표 local state
  const [fitnessGoal, setFitnessGoal] = useState(currentUser.fitnessGoal ?? "")

  // 보유 장비 local state
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    currentUser.equipment ?? []
  )

  // 신체 정보 local state
  const [heightCm, setHeightCm] = useState(
    currentUser.heightCm !== undefined ? String(currentUser.heightCm) : ""
  )
  const [weightKg, setWeightKg] = useState(
    currentUser.weightKg !== undefined ? String(currentUser.weightKg) : ""
  )
  const [age, setAge] = useState(
    currentUser.age !== undefined ? String(currentUser.age) : ""
  )
  const [injuries, setInjuries] = useState(currentUser.injuries ?? "")
  const [saved, setSaved] = useState(false)

  function toggleEquipment(value: string) {
    setSelectedEquipment((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  function handleSave() {
    // Phase 1: local state only, no API
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col pb-8">
      {/* 프로필 헤더 */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.nickname} size="lg" />
          <div>
            <h1 className="text-xl font-bold">{currentUser.nickname}</h1>
            {(currentUser.age || currentUser.gender) && (
              <p className="text-sm text-muted-foreground">
                {[
                  currentUser.age ? `${currentUser.age}세` : null,
                  currentUser.gender ? GENDER_KO[currentUser.gender] : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>

        {/* 신체 정보 카드 */}
        {(currentUser.heightCm || currentUser.weightKg) && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {currentUser.heightCm && (
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">키</p>
                  <p className="text-lg font-semibold mt-0.5">{currentUser.heightCm}
                    <span className="text-xs text-muted-foreground font-normal ml-0.5">cm</span>
                  </p>
                </CardContent>
              </Card>
            )}
            {currentUser.weightKg && (
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">몸무게</p>
                  <p className="text-lg font-semibold mt-0.5">{currentUser.weightKg}
                    <span className="text-xs text-muted-foreground font-normal ml-0.5">kg</span>
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* 운동 목표 섹션 */}
      <div className="px-4 py-5">
        <h2 className="text-sm font-semibold mb-1">운동 목표</h2>
        {fitnessGoal && (
          <p className="text-xs text-muted-foreground mb-3">현재 목표: {fitnessGoal}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {FITNESS_GOALS.map((goal) => (
            <button
              key={goal}
              onClick={() => setFitnessGoal(goal)}
              className={[
                "h-8 rounded-full px-3 text-sm font-medium border transition-colors",
                fitnessGoal === goal
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted",
              ].join(" ")}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* 보유 장비 섹션 */}
      <div className="px-4 py-5">
        <h2 className="text-sm font-semibold mb-3">보유 장비</h2>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_LIST.map((item) => {
            const isSelected = selectedEquipment.includes(item.value)
            return (
              <button
                key={item.value}
                onClick={() => toggleEquipment(item.value)}
                className={[
                  "inline-flex items-center gap-1.5 h-8 rounded-full px-3 text-sm font-medium border transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted",
                ].join(" ")}
              >
                {isSelected && <Check className="size-3.5" />}
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* 신체 정보 편집 */}
      <div className="px-4 py-5">
        <h2 className="text-sm font-semibold mb-4">신체 정보 편집</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground w-16 shrink-0">키</label>
            <div className="relative flex-1">
              <Input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="예: 175"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                cm
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground w-16 shrink-0">몸무게</label>
            <div className="relative flex-1">
              <Input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="예: 70"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                kg
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground w-16 shrink-0">나이</label>
            <div className="relative flex-1">
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="예: 30"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                세
              </span>
            </div>
          </div>
        </div>

        {/* 부상/특이사항 */}
        <div className="mt-4">
          <label className="text-sm text-muted-foreground mb-1.5 block">
            부상 / 특이사항
          </label>
          <textarea
            value={injuries}
            onChange={(e) => setInjuries(e.target.value)}
            placeholder="예: 왼쪽 어깨 회전근개 부상 (2024), 허리 디스크 주의"
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            AI 루틴 추천 시 반영됩니다
          </p>
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleSave}
          variant={saved ? "secondary" : "default"}
        >
          {saved ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4" />
              저장되었어요
            </span>
          ) : (
            "저장"
          )}
        </Button>
      </div>

      <Separator />

      {/* 파트너 정보 섹션 */}
      {partner && (
        <>
          <div className="px-4 py-5">
            <h2 className="text-sm font-semibold mb-3">파트너</h2>
            <div className="flex items-center gap-3">
              <Avatar name={partner.nickname} size="md" />
              <div>
                <p className="text-sm font-medium">{partner.nickname}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="secondary" className="text-xs">
                    파트너 운동 공유 중
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* 앱 정보 */}
      <div className="px-4 py-5">
        <h2 className="text-sm font-semibold mb-3">앱 정보</h2>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">앱 이름</span>
            <span className="text-sm">Fit — AI 피트니스 에이전트</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">버전</span>
            <span className="text-sm text-muted-foreground">v0.1.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
