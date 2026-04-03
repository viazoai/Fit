import { createContext, useContext, useState, type ReactNode } from "react"
import type { ShopItem, UserCoupon, PointLedgerEntry, WorkoutSessionSummary } from "@/types"
import { DEFAULT_SHOP_ITEMS } from "@/mocks/shop-items"

const KEY_BALANCE = (userId: string) => `fit_points_balance_${userId}`
const KEY_HISTORY = "fit_points_history"
const KEY_COUPONS = "fit_user_coupons"
const KEY_CUSTOM_ITEMS = "fit_custom_shop_items"

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Gamification은 localStorage 기반이므로 userId를 문자열로 사용
const userIdStr = (id: number | string) => String(id)

function calcStreak(userId: number, date: string, workouts: WorkoutSessionSummary[]): number {
  const dates = workouts
    .filter((w) => w.user_id === userId)
    .map((w) => w.date)
    .sort((a, b) => b.localeCompare(a))
  if (dates.length === 0) return 0

  let streak = 0
  let checkMs = new Date(date).getTime()
  for (let i = 0; i < 365; i++) {
    const checkStr = new Date(checkMs).toISOString().split("T")[0]
    if (dates.includes(checkStr)) {
      streak++
      checkMs -= 86400000
    } else {
      if (i === 0) {
        checkMs -= 86400000
        continue
      }
      break
    }
  }
  return streak
}

export interface EarnResult {
  totalEarned: number
  breakdown: Array<{ reason: string; amount: number }>
}

interface PointsContextValue {
  getBalance: (userId: string | number) => number
  history: PointLedgerEntry[]
  coupons: UserCoupon[]
  shopItems: ShopItem[]
  earnPoints: (userId: number, date: string, workouts: WorkoutSessionSummary[]) => EarnResult | null
  purchaseItem: (userId: string | number, item: ShopItem) => boolean
  useItem: (couponId: string) => void
  refundItem: (couponId: string) => void
  addCustomItem: (item: Omit<ShopItem, "id" | "isCustom">) => void
  updateCustomItem: (id: string, updates: Partial<Pick<ShopItem, "name" | "description" | "price">>) => void
  deleteCustomItem: (id: string) => void
  devAddPoints: (userId: string | number, amount: number) => void
}

const PointsContext = createContext<PointsContextValue | null>(null)

export function PointsProvider({ children }: { children: ReactNode }) {
  const [balances, setBalances] = useState<Record<string, number>>(() => {
    // 기존 localStorage 키와 호환
    return {}
  })

  const [history, setHistory] = useState<PointLedgerEntry[]>(() =>
    load(KEY_HISTORY, [])
  )

  const [coupons, setCoupons] = useState<UserCoupon[]>(() =>
    load(KEY_COUPONS, [])
  )

  const [customItems, setCustomItems] = useState<ShopItem[]>(() =>
    load(KEY_CUSTOM_ITEMS, [])
  )

  const shopItems = [...DEFAULT_SHOP_ITEMS, ...customItems]

  function getBalance(userId: string | number): number {
    const key = userIdStr(userId)
    return balances[key] ?? load(KEY_BALANCE(key), 0)
  }

  function devAddPoints(userId: string | number, amount: number) {
    const uid = userIdStr(userId)
    const newBalance = (balances[uid] ?? load(KEY_BALANCE(uid), 0)) + amount
    setBalances((prev) => {
      const updated = { ...prev, [uid]: newBalance }
      save(KEY_BALANCE(uid), newBalance)
      return updated
    })
    const entry: PointLedgerEntry = {
      id: crypto.randomUUID().slice(0, 8),
      userId: uid,
      amount,
      reason: "[개발] 포인트 추가",
      balance: newBalance,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    }
    setHistory((prev) => {
      const updated = [entry, ...prev]
      save(KEY_HISTORY, updated)
      return updated
    })
  }

  function earnPoints(userId: number, date: string, workouts: WorkoutSessionSummary[]): EarnResult | null {
    // 하루 1회만 세션 완료 포인트 지급
    const alreadyEarned = history.some(
      (e) => e.userId === String(userId) && e.reason === "운동 완료" && e.date === date
    )
    if (alreadyEarned) return null

    const breakdown: Array<{ reason: string; amount: number }> = []
    breakdown.push({ reason: "운동 완료", amount: 100 })

    // 스트릭 보너스
    const streak = calcStreak(userId, date, workouts)
    if (streak > 0 && streak % 3 === 0 && streak < 7) {
      breakdown.push({ reason: `${streak}일 연속 달성 보너스`, amount: 50 })
    } else if (streak === 7) {
      breakdown.push({ reason: "7일 연속 달성 보너스", amount: 150 })
    } else if (streak === 30) {
      breakdown.push({ reason: "30일 연속 달성 보너스", amount: 500 })
    }

    // 커플 보너스
    const partnerWorkedToday = workouts.some(
      (w) => w.user_id !== userId && w.date === date
    )
    if (partnerWorkedToday) {
      breakdown.push({ reason: "커플 동시 운동 보너스", amount: 50 })
    }

    const totalEarned = breakdown.reduce((sum, b) => sum + b.amount, 0)
    const uid = userIdStr(userId)
    const currentBalance = balances[uid] ?? load(KEY_BALANCE(uid), 0)
    const newBalance = currentBalance + totalEarned

    setBalances((prev) => {
      const updated = { ...prev, [uid]: newBalance }
      save(KEY_BALANCE(uid), newBalance)
      return updated
    })

    // 내역 추가 (각 항목별)
    let runningBalance = currentBalance
    const entries: PointLedgerEntry[] = breakdown.map(({ reason, amount }) => {
      runningBalance += amount
      return {
        id: crypto.randomUUID().slice(0, 8),
        userId: uid,
        amount,
        reason,
        balance: runningBalance,
        date,
        createdAt: new Date().toISOString(),
      }
    })

    setHistory((prev) => {
      const updated = [...entries, ...prev]
      save(KEY_HISTORY, updated)
      return updated
    })

    return { totalEarned, breakdown }
  }

  function purchaseItem(userId: string | number, item: ShopItem): boolean {
    const uid = userIdStr(userId)
    const balance = balances[uid] ?? load(KEY_BALANCE(uid), 0)
    if (balance < item.price) return false

    const newBalance = balance - item.price
    setBalances((prev) => {
      const updated = { ...prev, [uid]: newBalance }
      save(KEY_BALANCE(uid), newBalance)
      return updated
    })

    const entry: PointLedgerEntry = {
      id: crypto.randomUUID().slice(0, 8),
      userId: uid,
      amount: -item.price,
      reason: `${item.name} 구매`,
      balance: newBalance,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    }
    setHistory((prev) => {
      const updated = [entry, ...prev]
      save(KEY_HISTORY, updated)
      return updated
    })

    const coupon: UserCoupon = {
      id: crypto.randomUUID().slice(0, 8),
      userId: uid,
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      purchasedAt: new Date().toISOString(),
      status: "unused",
    }
    setCoupons((prev) => {
      const updated = [coupon, ...prev]
      save(KEY_COUPONS, updated)
      return updated
    })

    return true
  }

  function useItem(couponId: string) {
    setCoupons((prev) => {
      const updated = prev.map((c) =>
        c.id === couponId
          ? { ...c, status: "used" as const, usedAt: new Date().toISOString() }
          : c
      )
      save(KEY_COUPONS, updated)
      return updated
    })
  }

  function refundItem(couponId: string) {
    const coupon = coupons.find((c) => c.id === couponId)
    if (!coupon || coupon.status !== "unused") return

    const userId = coupon.userId
    const newBalance = (balances[userId] ?? 0) + coupon.price
    setBalances((prev) => {
      const updated = { ...prev, [userId]: newBalance }
      save(KEY_BALANCE(userId), newBalance)
      return updated
    })

    const entry: PointLedgerEntry = {
      id: crypto.randomUUID().slice(0, 8),
      userId,
      amount: coupon.price,
      reason: `${coupon.itemName} 환불`,
      balance: newBalance,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    }
    setHistory((prev) => {
      const updated = [entry, ...prev]
      save(KEY_HISTORY, updated)
      return updated
    })

    setCoupons((prev) => {
      const updated = prev.map((c) =>
        c.id === couponId ? { ...c, status: "refunded" as const } : c
      )
      save(KEY_COUPONS, updated)
      return updated
    })
  }

  function addCustomItem(item: Omit<ShopItem, "id" | "isCustom">) {
    const newItem: ShopItem = {
      ...item,
      id: `custom-${crypto.randomUUID().slice(0, 8)}`,
      isCustom: true,
    }
    setCustomItems((prev) => {
      const updated = [...prev, newItem]
      save(KEY_CUSTOM_ITEMS, updated)
      return updated
    })
  }

  function updateCustomItem(id: string, updates: Partial<Pick<ShopItem, "name" | "description" | "price">>) {
    setCustomItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
      save(KEY_CUSTOM_ITEMS, updated)
      return updated
    })
  }

  function deleteCustomItem(id: string) {
    setCustomItems((prev) => {
      const updated = prev.filter((item) => item.id !== id)
      save(KEY_CUSTOM_ITEMS, updated)
      return updated
    })
  }

  return (
    <PointsContext
      value={{
        getBalance,
        history,
        coupons,
        shopItems,
        earnPoints,
        purchaseItem,
        useItem,
        refundItem,
        addCustomItem,
        updateCustomItem,
        deleteCustomItem,
        devAddPoints,
      }}
    >
      {children}
    </PointsContext>
  )
}

export function usePoints(): PointsContextValue {
  const ctx = useContext(PointsContext)
  if (!ctx) throw new Error("usePoints must be used within PointsProvider")
  return ctx
}
