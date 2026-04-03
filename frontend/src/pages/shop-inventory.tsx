import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Package, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/context/user-context"
import { usePoints } from "@/context/points-context"
import type { UserCoupon } from "@/types"

type Filter = "unused" | "used" | "refunded"

const FILTER_LABELS: Record<Filter, string> = {
  unused: "미사용",
  used: "사용완료",
  refunded: "환불",
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split("T")[0].split("-").map(Number)
  return `${m}월 ${d}일`
}

function CouponCard({
  coupon,
  onUse,
  onRefund,
}: {
  coupon: UserCoupon
  onUse: () => void
  onRefund: () => void
}) {
  return (
    <Card className={cn(coupon.status !== "unused" && "opacity-60")}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{coupon.itemName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Coins className="size-3 text-primary" />
              <span className="text-xs text-muted-foreground">
                {coupon.price.toLocaleString()}P · 구매 {formatDate(coupon.purchasedAt)}
              </span>
            </div>
            {coupon.status === "used" && coupon.usedAt && (
              <p className="text-xs text-muted-foreground mt-0.5">
                사용 {formatDate(coupon.usedAt)}
              </p>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
              coupon.status === "unused" && "bg-primary/10 text-primary",
              coupon.status === "used" && "bg-muted text-muted-foreground",
              coupon.status === "refunded" && "bg-muted text-muted-foreground"
            )}
          >
            {FILTER_LABELS[coupon.status]}
          </span>
        </div>

        {coupon.status === "unused" && (
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="flex-1" onClick={onUse}>
              사용하기
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={onRefund}>
              환불 ({coupon.price.toLocaleString()}P)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ShopInventoryPage() {
  const navigate = useNavigate()
  const { currentUserId } = useCurrentUser()
  const { coupons, useItem, refundItem } = usePoints()

  const [filter, setFilter] = useState<Filter>("unused")
  const [usingCoupon, setUsingCoupon] = useState<UserCoupon | null>(null)
  const [refundingCoupon, setRefundingCoupon] = useState<UserCoupon | null>(null)

  const myCoupons = coupons
    .filter((c) => c.userId === String(currentUserId) && c.status === filter)
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))

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
        <h1 className="text-[30px] font-bold">내 인벤토리</h1>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {(["unused", "used", "refunded"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* 쿠폰 목록 */}
      {myCoupons.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Package className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {filter === "unused"
              ? "보유한 쿠폰이 없어요.\nShop에서 아이템을 구매해보세요!"
              : `${FILTER_LABELS[filter]} 쿠폰이 없어요`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {myCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onUse={() => setUsingCoupon(coupon)}
              onRefund={() => setRefundingCoupon(coupon)}
            />
          ))}
        </div>
      )}

      {/* 사용 확인 다이얼로그 */}
      {usingCoupon && (
        <Dialog open onOpenChange={(open) => !open && setUsingCoupon(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>쿠폰 사용</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{usingCoupon.itemName}</span>을(를)
                사용할까요? 사용 후에는 취소할 수 없어요.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setUsingCoupon(null)}>
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    useItem(usingCoupon.id)
                    setUsingCoupon(null)
                  }}
                >
                  사용하기
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 환불 확인 다이얼로그 */}
      {refundingCoupon && (
        <Dialog open onOpenChange={(open) => !open && setRefundingCoupon(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>쿠폰 환불</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{refundingCoupon.itemName}</span>을(를)
                환불할까요?{" "}
                <span className="font-semibold text-primary">
                  {refundingCoupon.price.toLocaleString()}P
                </span>
                가 반환돼요.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setRefundingCoupon(null)}>
                  취소
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    refundItem(refundingCoupon.id)
                    setRefundingCoupon(null)
                  }}
                >
                  환불하기
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
