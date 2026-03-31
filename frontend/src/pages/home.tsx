import { Link } from "react-router-dom"
import { Flame, TrendingUp, Calendar, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/context/user-context"
import { mockWorkouts, mockExercises } from "@/mocks"

const TODAY = "2026-03-31"
const WEEK_GOAL = 4

// 이번 주: 2026-03-30(월) ~ 2026-04-05(일)
const THIS_WEEK_DAYS = [
  "2026-03-30",
  "2026-03-31",
  "2026-04-01",
  "2026-04-02",
  "2026-04-03",
  "2026-04-04",
  "2026-04-05",
]
const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"]

const BODY_PART_KO: Record<string, string> = {
  chest: "가슴",
  back: "등",
  shoulder: "어깨",
  legs: "하체",
  arms: "팔",
  core: "코어",
  cardio: "유산소",
}

function getDaysAgo(dateStr: string): number {
  const target = new Date(dateStr)
  const today = new Date(TODAY)
  const diff = today.getTime() - target.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const d = new Date(year, month - 1, day)
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
  return `${month}월 ${day}일 (${weekdays[d.getDay()]})`
}

export default function HomePage() {
  const { currentUser, partner } = useCurrentUser()

  // 오늘 나의 운동
  const todayWorkout = mockWorkouts.find(
    (w) => w.userId === currentUser.id && w.date === TODAY
  )

  // 오늘 운동한 종목 목록
  const todayExerciseIds = todayWorkout
    ? [...new Set(todayWorkout.sets.map((s) => s.exerciseId))]
    : []
  const todayExercises = todayExerciseIds.map((id) =>
    mockExercises.find((e) => e.id === id)
  )

  // 이번 주 운동한 날
  const myWorkoutsThisWeek = THIS_WEEK_DAYS.filter((day) =>
    mockWorkouts.some((w) => w.userId === currentUser.id && w.date === day)
  )

  // 파트너 최근 운동
  const partnerWorkouts = partner
    ? mockWorkouts
        .filter((w) => w.userId === partner.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : []
  const partnerLatest = partnerWorkouts[0]

  // 나의 최근 운동 (오늘 제외, 최대 3개)
  const recentWorkouts = mockWorkouts
    .filter((w) => w.userId === currentUser.id && w.date !== TODAY)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  const weekProgress = Math.min(
    Math.round((myWorkoutsThisWeek.length / WEEK_GOAL) * 100),
    100
  )

  return (
    <div className="px-4 py-4 space-y-4">
      {/* 헤더 인사 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{formatDate(TODAY)}</p>
          <h1 className="text-xl font-bold">
            안녕하세요, {currentUser.nickname}님 👋
          </h1>
        </div>
        <Avatar name={currentUser.nickname} size="md" />
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
              <Link
                to="/workout"
                className={cn(buttonVariants({ variant: "default" }), "w-full")}
              >
                운동 시작하기
              </Link>
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
            {THIS_WEEK_DAYS.map((day, i) => {
              const worked = mockWorkouts.some(
                (w) => w.userId === currentUser.id && w.date === day
              )
              const isToday = day === TODAY
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
                    {WEEKDAY_LABELS[i]}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 파트너 활동 미리보기 */}
      {partner && partnerLatest && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Avatar name={partner.nickname} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {partner.nickname}
                  {partnerLatest.date === TODAY
                    ? "이(가) 오늘 운동했어요! 🎉"
                    : getDaysAgo(partnerLatest.date) === 1
                    ? "이(가) 어제 운동했어요"
                    : `이(가) ${getDaysAgo(partnerLatest.date)}일 전 운동했어요`}
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
                to="/calendar"
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
                to="/calendar"
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
              const daysAgo = getDaysAgo(workout.date)

              return (
                <div key={workout.id}>
                  {idx > 0 && <Separator className="my-3" />}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatDate(workout.date)}
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
                        <Flame className="size-3 text-orange-500" />
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
  )
}
