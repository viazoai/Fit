import { useNavigate } from "react-router-dom"
import { ChevronLeft, Coins, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/context/user-context"
import { usePoints } from "@/context/points-context"

function formatDatetime(iso: string): string {
  const d = new Date(iso)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${m}월 ${day}일 ${h}:${min}`
}

export default function ShopHistoryPage() {
  const navigate = useNavigate()
  const { currentUserId } = useCurrentUser()
  const { history, getBalance } = usePoints()

  const myHistory = history
    .filter((e) => e.userId === String(currentUserId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const balance = getBalance(currentUserId)

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-2xl font-bold">포인트 내역</h1>
      </div>

      {/* 잔액 카드 */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="py-4 px-5">
          <p className="text-xs opacity-80 mb-0.5">현재 잔액</p>
          <div className="flex items-center gap-2">
            <Coins className="size-5 opacity-80" />
            <span className="text-2xl font-bold tabular-nums">
              {balance.toLocaleString()}P
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 내역 리스트 */}
      {myHistory.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Coins className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            아직 포인트 내역이 없어요.<br />운동을 완료하면 포인트가 쌓여요!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {myHistory.map((entry) => {
            const isEarn = entry.amount > 0
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full shrink-0",
                      isEarn ? "bg-primary/10" : "bg-muted"
                    )}
                  >
                    {isEarn ? (
                      <TrendingUp className="size-4 text-primary" />
                    ) : (
                      <TrendingDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{entry.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDatetime(entry.createdAt)} · 잔액 {entry.balance.toLocaleString()}P
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    isEarn ? "text-primary" : "text-foreground"
                  )}
                >
                  {isEarn ? "+" : ""}{entry.amount.toLocaleString()}P
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
