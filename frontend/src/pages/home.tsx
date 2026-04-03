import { useRef } from "react"
import { Link } from "react-router-dom"
import { Activity, Flame, Calendar, ChevronRight, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCurrentUser } from "@/context/user-context"
import { useWorkouts } from "@/context/workout-context"
import { getToday, getDaysAgo, formatDateKo } from "@/lib/date-utils"
import { WeeklyProgressCard } from "@/components/workout/WeeklyProgressCard"
import { RadarChart } from "@/components/charts/RadarChart"

const BG_STORAGE_KEY = "fit-home-bg"
const PROFILE_KEY = (userId: number) => `fit_profile_${userId}`

export default function HomePage() {
  const { currentUser } = useCurrentUser()
  const { summaries } = useWorkouts()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleBgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      localStorage.setItem(BG_STORAGE_KEY, reader.result as string)
      window.dispatchEvent(new CustomEvent("fit-home-bg-changed"))
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const today = getToday()

  // 로컬 프로필 (체성분)
  const profile = (() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY(currentUser.id)) ?? "{}") } catch { return {} }
  })()
  const weightKg = parseFloat(profile.weightKg) || 0
  const muscleMassKg = parseFloat(profile.muscleMassKg) || 0
  const bodyFatPct = parseFloat(profile.bodyFatPct) || 0
  const heightCm = parseFloat(profile.heightCm) || 0
  const hasBodyData = weightKg > 0 || muscleMassKg > 0 || bodyFatPct > 0

  // 오늘 나의 운동 (summaries 기반)
  const todaySummary = summaries.find(
    (w) => w.user_id === currentUser.id && w.date === today
  )

  // 나의 최근 운동 (오늘 제외, 최대 3개)
  const recentSummaries = summaries
    .filter((w) => w.user_id === currentUser.id && w.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  return (
    <div className="relative">
    <div className="relative px-4 py-4 space-y-4" style={{ zIndex: 10 }}>
      {/* 헤더 인사 */}
      <div className="pt-[160px] flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{formatDateKo(today)}</p>
          <h1 className="text-[30px] font-bold">
            안녕하세요, {currentUser.name}님 👋
          </h1>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mb-0.5 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="홈 배경 사진 변경"
        >
          <Pencil className="size-3.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBgChange}
        />
      </div>

      {/* 오늘의 운동 요약 카드 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">오늘의 운동</CardTitle>
            <Badge variant={todaySummary ? "default" : "outline"}>
              {todaySummary ? "완료" : "미완료"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {todaySummary ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{todaySummary.exercise_count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">운동 종목</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">
                    {todaySummary.kcal ?? "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">칼로리(kcal)</p>
                </div>
              </div>
              {todaySummary.muscle_groups.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {todaySummary.muscle_groups.map((mg) => (
                    <Badge key={mg} variant="secondary">
                      {mg}
                    </Badge>
                  ))}
                </div>
              )}
              {todaySummary.memo && (
                <p className="text-sm text-muted-foreground">
                  {todaySummary.memo}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                아직 운동을 시작하지 않았어요
              </p>
              <p className="text-xs text-muted-foreground">
                하단 Workout 탭에서 운동을 시작해보세요!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 이번 주 운동 현황 */}
      <WeeklyProgressCard />

      {/* 체성분 분석 */}
      {hasBodyData && (() => {
        const bmi = heightCm > 0 ? weightKg / Math.pow(heightCm / 100, 2) : 0
        const radarData = [
          { label: "체중",    value: weightKg,                                    max: 100, target: 65 },
          { label: "골격근",  value: muscleMassKg,                                max: 50,  target: 35 },
          { label: "체지방↓", value: bodyFatPct > 0 ? 100 - bodyFatPct : 0,      max: 100, target: 85 },
          { label: "BMI",    value: bmi,                                          max: 30,  target: 22 },
          { label: "키",     value: heightCm,                                     max: 200 },
        ]
        return (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                <CardTitle className="text-base">체성분 분석</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <RadarChart data={radarData} size={180} />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 rounded-full bg-accent-heat" />
                  <span>현재</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 rounded-full bg-primary opacity-70" style={{ backgroundImage: "repeating-linear-gradient(90deg, #CCFF00 0 4px, transparent 4px 7px)" }} />
                  <span>목표</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground w-full px-2">
                {muscleMassKg > 0 && (
                  <div className="flex justify-between">
                    <span>골격근량</span>
                    <span className="font-medium text-foreground">{muscleMassKg}kg</span>
                  </div>
                )}
                {bodyFatPct > 0 && (
                  <div className="flex justify-between">
                    <span>체지방률</span>
                    <span className="font-medium text-foreground">{bodyFatPct}%</span>
                  </div>
                )}
                {bmi > 0 && (
                  <div className="flex justify-between">
                    <span>BMI</span>
                    <span className="font-medium text-foreground">{bmi.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* 최근 운동 기록 */}
      {recentSummaries.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <CardTitle className="text-base">최근 운동 기록</CardTitle>
              </div>
              <Link
                to="/log"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
              >
                전체 보기
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentSummaries.map((summary, idx) => {
              const daysAgo = getDaysAgo(summary.date, today)

              return (
                <div key={summary.id}>
                  {idx > 0 && <Separator className="my-3" />}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatDateKo(summary.date)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {daysAgo === 1 ? "어제" : `${daysAgo}일 전`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {summary.muscle_groups.slice(0, 3).map((mg) => (
                          <Badge key={mg} variant="outline" className="text-xs">
                            {mg}
                          </Badge>
                        ))}
                        {summary.muscle_groups.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{summary.muscle_groups.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {summary.kcal ?? "-"}
                        <span className="text-xs text-muted-foreground font-normal">
                          {" "}
                          kcal
                        </span>
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <Flame className="size-3 text-accent-heat" />
                        <span className="text-xs text-muted-foreground">
                          {summary.exercise_count}종목
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
    </div>
  )
}
