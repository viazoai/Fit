import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ShoppingBag,
  Package,
  History,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCurrentUser } from "@/context/user-context"
import { usePoints } from "@/context/points-context"
import type { ShopItem } from "@/types"

// ─── 구매 확인 다이얼로그 ─────────────────────────────────────────────────────

function PurchaseDialog({
  item,
  balance,
  onConfirm,
  onClose,
}: {
  item: ShopItem
  balance: number
  onConfirm: () => void
  onClose: () => void
}) {
  const canAfford = balance >= item.price

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">현재 잔액</span>
              <span className="font-medium">{balance.toLocaleString()}P</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">차감 금액</span>
              <span className="font-medium text-destructive">-{item.price.toLocaleString()}P</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
              <span>구매 후 잔액</span>
              <span className={canAfford ? "text-foreground" : "text-destructive"}>
                {(balance - item.price).toLocaleString()}P
              </span>
            </div>
          </div>
          {!canAfford && (
            <p className="text-xs text-destructive text-center">
              {(item.price - balance).toLocaleString()}P가 부족해요
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-10 rounded-xl" onClick={onClose}>
              취소
            </Button>
            <Button className="flex-1 h-10 rounded-xl" disabled={!canAfford} onClick={onConfirm}>
              구매하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── 커스텀 아이템 편집 다이얼로그 ────────────────────────────────────────────

function ItemEditDialog({
  initial,
  onSave,
  onClose,
}: {
  initial?: ShopItem
  onSave: (data: { name: string; description: string; price: number }) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [priceStr, setPriceStr] = useState(initial ? String(initial.price) : "")
  const [error, setError] = useState("")

  function handleSave() {
    const trimmed = name.trim()
    const price = Number(priceStr)
    if (!trimmed) { setError("아이템 이름을 입력해주세요"); return }
    if (!price || price < 100 || price > 10000) { setError("가격은 100P ~ 10,000P 사이여야 해요"); return }
    onSave({ name: trimmed, description: description.trim(), price })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{initial ? "아이템 수정" : "새 아이템 추가"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">아이템 이름</label>
            <Input
              placeholder="예: 안마 쿠폰"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">설명 (선택)</label>
            <Input
              placeholder="예: 15분 안마 1회"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">가격 (100P ~ 10,000P)</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="1000"
                min={100}
                max={10000}
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">P</span>
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 h-10 rounded-xl" onClick={onClose}>
              취소
            </Button>
            <Button className="flex-1 h-10 rounded-xl" onClick={handleSave}>
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── 아이템 카드 ──────────────────────────────────────────────────────────────

function ItemCard({
  item,
  balance,
  onBuy,
  onEdit,
  onDelete,
}: {
  item: ShopItem
  balance: number
  onBuy: (item: ShopItem) => void
  onEdit?: (item: ShopItem) => void
  onDelete?: (item: ShopItem) => void
}) {
  const canAfford = balance >= item.price
  const shortage = item.price - balance

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-col gap-2 pt-4 pb-3 flex-1">
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-semibold leading-tight">{item.name}</p>
          {item.isCustom && onEdit && onDelete && (
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => onEdit(item)}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={() => onDelete(item)}
                className="rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground">{item.description}</p>
        )}
        <p className="text-base font-bold text-primary mt-auto">
          {item.price.toLocaleString()}P
        </p>
        <Button
          size="sm"
          className="w-full py-2.5 h-auto rounded-xl"
          disabled={!canAfford}
          onClick={() => onBuy(item)}
        >
          {canAfford ? "구매" : `${shortage.toLocaleString()}P 부족`}
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function ShopPage() {
  const { currentUserId } = useCurrentUser()
  const { getBalance, shopItems, purchaseItem, deleteCustomItem, addCustomItem, updateCustomItem, devAddPoints } = usePoints()

  const balance = getBalance(currentUserId)

  const [buyingItem, setBuyingItem] = useState<ShopItem | null>(null)
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [purchased, setPurchased] = useState<string | null>(null) // 최근 구매한 아이템 id (성공 피드백)

  function handleBuy(item: ShopItem) {
    setBuyingItem(item)
  }

  function handleConfirmBuy() {
    if (!buyingItem) return
    const ok = purchaseItem(currentUserId, buyingItem)
    if (ok) {
      setPurchased(buyingItem.id)
      setTimeout(() => setPurchased(null), 2000)
    }
    setBuyingItem(null)
  }

  function handleDeleteItem(item: ShopItem) {
    if (window.confirm(`"${item.name}"을(를) 삭제할까요?`)) {
      deleteCustomItem(item.id)
    }
  }

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* 타이틀 */}
      <h1 className="text-2xl font-bold">Shop</h1>

      {/* 포인트 배너 */}
      <div className="rounded-2xl bg-card text-foreground px-5 pt-5 pb-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">보유 포인트</p>
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-bold tabular-nums leading-none">
              {balance.toLocaleString()}
            </span>
            <span className="text-lg font-semibold text-muted-foreground pb-0.5">P</span>
          </div>
        </div>

        <div className="flex gap-2 border-t border-border pt-3">
          <Link
            to="/shop/inventory"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-muted hover:bg-muted/60 transition-colors py-2.5 text-xs font-medium"
          >
            <Package className="size-3.5" />
            내 인벤토리
          </Link>
          <Link
            to="/shop/history"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-muted hover:bg-muted/60 transition-colors py-2.5 text-xs font-medium"
          >
            <History className="size-3.5" />
            포인트 내역
          </Link>
        </div>
      </div>

      {/* 아이템 그리드 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground">아이템샵</h2>
          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:opacity-80 transition-opacity"
          >
            <Plus className="size-3.5" />
            아이템 추가
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {shopItems.map((item) => (
            <div key={item.id} className="relative">
              {purchased === item.id && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow">
                    구매 완료!
                  </span>
                </div>
              )}
              <ItemCard
                item={item}
                balance={balance}
                onBuy={handleBuy}
                onEdit={item.isCustom ? setEditingItem : undefined}
                onDelete={item.isCustom ? handleDeleteItem : undefined}
              />
            </div>
          ))}
        </div>

        {shopItems.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <ShoppingBag className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                아이템이 없어요.<br />
                <button onClick={() => setAddingNew(true)} className="text-primary underline">
                  아이템을 추가
                </button>
                해보세요!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 포인트 획득 안내 */}
      <Card className="bg-muted/40">
        <CardContent className="py-3 px-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">포인트 획득 방법</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>운동 세션 완료</span>
              <span className="font-medium text-foreground">+100P</span>
            </div>
            <div className="flex justify-between">
              <span>3일 연속 운동</span>
              <span className="font-medium text-foreground">+50P</span>
            </div>
            <div className="flex justify-between">
              <span>7일 연속 운동</span>
              <span className="font-medium text-foreground">+150P</span>
            </div>
            <div className="flex justify-between">
              <span>커플 같은 날 운동</span>
              <span className="font-medium text-foreground">+50P</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 개발용 포인트 추가 버튼 */}
      {import.meta.env.DEV && (
        <button
          onClick={() => devAddPoints(currentUserId, 5000)}
          className="w-full rounded-lg border border-dashed border-muted-foreground/30 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          [DEV] +5,000P 추가
        </button>
      )}

      {/* 다이얼로그들 */}
      {buyingItem && (
        <PurchaseDialog
          item={buyingItem}
          balance={balance}
          onConfirm={handleConfirmBuy}
          onClose={() => setBuyingItem(null)}
        />
      )}

      {editingItem && (
        <ItemEditDialog
          initial={editingItem}
          onSave={(data) => {
            updateCustomItem(editingItem.id, data)
            setEditingItem(null)
          }}
          onClose={() => setEditingItem(null)}
        />
      )}

      {addingNew && (
        <ItemEditDialog
          onSave={(data) => {
            addCustomItem(data)
            setAddingNew(false)
          }}
          onClose={() => setAddingNew(false)}
        />
      )}
    </div>
  )
}
