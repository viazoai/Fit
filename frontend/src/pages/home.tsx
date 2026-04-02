import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Flame, TrendingUp, Calendar, ChevronRight, Activity, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/context/user-context"
import { useWorkouts } from "@/context/workout-context"
import { mockExercises } from "@/mocks"
import { BODY_PART_KO, WEEK_GOAL } from "@/lib/constants"
import { getToday, getThisWeekDays, getDaysAgo, formatDateKo } from "@/lib/date-utils"
import { RadarChart } from "@/components/charts/RadarChart"

const WEEKDAY_LABELS_MON = ["월", "화", "수", "목", "금", "토", "일"]

const BG_STORAGE_KEY = "fit-home-bg"

export default function HomePage() {
  const { currentUser, partner } = useCurrentUser()
  const { workouts } = useWorkouts()
  const [bgImage, setBgImage] = useState<string | null>(
    () => localStorage.getItem(BG_STORAGE_KEY)
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleBgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      localStorage.setItem(BG_STORAGE_KEY, dataUrl)
      setBgImage(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const today = getToday()
  const thisWeekDays = getThisWeekDays(today)

  // 오늘 나의 운동
  const todayWorkout = workouts.find(
    (w) => w.userId === currentUser.id && w.date === today
  )

  // 오늘 운동한 종목 목록
  const todayExerciseIds = todayWorkout
    ? [...new Set(todayWorkout.sets.map((s) => s.exerciseId))]
    : []
  const todayExercises = todayExerciseIds.map((id) =>
    mockExercises.find((e) => e.id === id)
  )

  // 이번 주 운동한 날
  const myWorkoutsThisWeek = thisWeekDays.filter((day) =>
    workouts.some((w) => w.userId === currentUser.id && w.date === day)
  )

  // 파트너 최근 운동
  const partnerWorkouts = partner
    ? workouts
        .filter((w) => w.userId === partner.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : []
  const partnerLatest = partnerWorkouts[0]

  // 나의 최근 운동 (오늘 제외, 최대 3개)
  const recentWorkouts = workouts
    .filter((w) => w.userId === currentUser.id && w.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  const weekProgress = Math.min(
    Math.round((myWorkoutsThisWeek.length / WEEK_GOAL) * 100),
    100
  )

  return (
    <>
      {/* 고정 배경 이미지 (헤더 뒤~그리팅 직전까지 페이드아웃) */}
      {bgImage && (
        <div
          className="fixed inset-x-0 top-0 h-[360px] pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <img
            src={bgImage}
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-top"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(15,15,15,0.08) 0%, rgba(15,15,15,0.55) 35%, rgba(15,15,15,0.92) 55%, rgba(15,15,15,1) 75%)",
            }}
          />
        </div>
      )}

    <div className="relative px-4 py-4 space-y-4" style={{ zIndex: 10 }}>
      {/* 헤더 인사 */}
      <div className="pt-[100px] flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{formatDateKo(today)}</p>
          <h1 className="text-xl font-bold">
            안녕하세요, {currentUser.nickname}님 👋
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
            <Badge variant={todayWorkout ? "default" : "outline"}>
              {todayWorkout ? "완료" : "미완료"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {todayWorkout ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{todayWorkout.sets.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">총 세트</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{todayExerciseIds.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">운동 종목</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">
                    {todayWorkout.caloriesBurned ?? "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">칼로리(kcal)</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">
                    {todayWorkout.overallRpe ?? "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">RPE</p>
                </div>
              </div>
              {todayExercises.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {todayExercises.map(
                    (ex) =>
                      ex && (
                        <Badge key={ex.id} variant="secondary">
                          {BODY_PART_KO[ex.bodyPart] ?? ex.bodyPart} · {ex.nameKo}
                        </Badge>
                      )
                  )}
                </div>
              )}
              {todayWorkout.memo && (
                <p className="text-sm text-muted-foreground">
                  💬 {todayWorkout.memo}
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
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <CardTitle className="text-base">이번 주 현황</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            이번 주{" "}
            <span className="font-semibold text-foreground">
              {myWorkoutsThisWeek.length}회
            </span>{" "}
            운동 · 목표{" "}
            <span className="font-semibold text-foreground">{WEEK_GOAL}회</span>
          </p>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium">진행률</span>
            <span className="text-muted-foreground tabular-nums">{weekProgress}%</span>
          </div>
          <Progress value={weekProgress} />
          {/* 요일별 도트 */}
          <div className="flex items-center justify-between pt-1">
            {thisWeekDays.map((day, i) => {
              const worked = workouts.some(
                (w) => w.userId === currentUser.id && w.date === day
              )
              const isToday = day === today
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "size-3 rounded-full transition-colors",
                      worked ? "bg-primary" : "bg-muted"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs",
                      isToday
                        ? "font-bold text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {WEEKDAY_LABELS_MON[i]}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 체성분 분석 */}
      {(currentUser.muscleMassKg != null || currentUser.bodyFatPct != null) && (() => {
        const bmi =
          currentUser.weightKg && currentUser.heightCm
            ? currentUser.weightKg / Math.pow(currentUser.heightCm / 100, 2)
            : 0

        const radarData = [
          { label: "체중", value: currentUser.weightKg ?? 0, max: 100 },
          { label: "골격근", value: currentUser.muscleMassKg ?? 0, max: 50 },
          { label: "체지방↓", value: currentUser.bodyFatPct ? 100 - currentUser.bodyFatPct : 0, max: 100 },
          { label: "BMI", value: bmi, max: 30 },
          { label: "키", value: currentUser.heightCm ?? 0, max: 200 },
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
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground w-full px-2">
                {currentUser.muscleMassKg && (
                  <div className="flex justify-between">
                    <span>골격근량</span>
                    <span className="font-medium text-foreground">{currentUser.muscleMassKg}kg</span>
                  </div>
                )}
                {currentUser.bodyFatPct && (
                  <div className="flex justify-between">
                    <span>체지방률</span>
                    <span className="font-medium text-foreground">{currentUser.bodyFatPct}%</span>
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

      {/* 파트너 활동 미리보기 */}
      {partner && partnerLatest && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">파트너 현황</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <Avatar name={partner.nickname} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {partner.nickname}
                  {partnerLatest.date === today
                    ? "이(가) 오늘 운동했어요! 🎉"
                    : getDaysAgo(partnerLatest.date, today) === 1
                    ? "이(가) 어제 운동했어요"
                    : `이(가) ${getDaysAgo(partnerLatest.date, today)}일 전 운동했어요`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {[
                    ...new Set(
                      partnerLatest.sets.map((s) => {
                        const ex = mockExercises.find(
                          (e) => e.id === s.exerciseId
                        )
                        return ex ? BODY_PART_KO[ex.bodyPart] ?? ex.bodyPart : ""
                      })
                    ),
                  ]
                    .filter(Boolean)
                    .join(" · ")}{" "}
                  운동
                </p>
              </div>
              <Link
                to="/log"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 최근 운동 기록 */}
      {recentWorkouts.length > 0 && (
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
            {recentWorkouts.map((workout, idx) => {
              const exerciseIds = [
                ...new Set(workout.sets.map((s) => s.exerciseId)),
              ]
              const exercises = exerciseIds
                .map((id) => mockExercises.find((e) => e.id === id))
                .filter(Boolean)
              const daysAgo = getDaysAgo(workout.date, today)

              return (
                <div key={workout.id}>
                  {idx > 0 && <Separator className="my-3" />}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatDateKo(workout.date)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {daysAgo === 1 ? "어제" : `${daysAgo}일 전`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {exercises.slice(0, 3).map(
                          (ex) =>
                            ex && (
                              <Badge key={ex.id} variant="outline" className="text-xs">
                                {ex.nameKo}
                              </Badge>
                            )
                        )}
                        {exercises.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{exercises.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {workout.caloriesBurned}
                        <span className="text-xs text-muted-foreground font-normal">
                          {" "}
                          kcal
                        </span>
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <Flame className="size-3 text-accent-heat" />
                        <span className="text-xs text-muted-foreground">
                          RPE {workout.overallRpe}
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
    </>
  )
}
