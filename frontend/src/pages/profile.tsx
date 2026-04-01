import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, ChevronLeft } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCurrentUser } from "@/context/user-context"
import { useToast } from "@/context/toast-context"

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
  const navigate = useNavigate()
  const { currentUser, updateUser } = useCurrentUser()
  const { toast } = useToast()

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

  function toggleEquipment(value: string) {
    setSelectedEquipment((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  function handleSave() {
    updateUser({
      fitnessGoal,
      equipment: selectedEquipment,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      age: age ? parseInt(age) : undefined,
      injuries: injuries || undefined,
    })
    toast("저장되었어요")
  }

  return (
    <div className="flex flex-col pb-8">
      {/* 프로필 헤더 */}
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center gap-1 mb-4">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-xl font-bold">프로필 설정</h1>
        </div>
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.nickname} size="lg" />
          <div>
            <p className="text-lg font-semibold">{currentUser.nickname}</p>
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
          <Textarea
            value={injuries}
            onChange={(e) => setInjuries(e.target.value)}
            placeholder="예: 왼쪽 어깨 회전근개 부상 (2024), 허리 디스크 주의"
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            AI 루틴 추천 시 반영됩니다
          </p>
        </div>

        <Button className="w-full mt-4" onClick={handleSave}>
          저장
        </Button>
      </div>

    </div>
  )
}
