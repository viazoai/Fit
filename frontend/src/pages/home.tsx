import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2">
        <Dumbbell className="size-12 text-primary" />
        <h1 className="text-2xl font-bold">Fit</h1>
        <p className="text-sm text-muted-foreground">AI 피트니스 에이전트</p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Phase 0 완료</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            프로젝트 부트스트랩이 완료되었습니다.
          </p>
          <Button>운동 시작하기</Button>
          <Button variant="outline">운동 라이브러리</Button>
        </CardContent>
      </Card>
    </div>
  )
}
