/**
 * 오늘 날짜를 YYYY-MM-DD 문자열로 반환
 */
export function getToday(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * 이번 주 월~일 날짜 배열 반환 (ISO 기준 월요일 시작)
 */
export function getThisWeekDays(refDate?: string): string[] {
  const d = refDate ? new Date(refDate) : new Date()
  const dayOfWeek = d.getDay() // 0=일, 1=월, ..., 6=토
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)

  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    const y = day.getFullYear()
    const m = String(day.getMonth() + 1).padStart(2, "0")
    const dd = String(day.getDate()).padStart(2, "0")
    days.push(`${y}-${m}-${dd}`)
  }
  return days
}

/**
 * 두 날짜 사이 일수 차이
 */
export function getDaysAgo(dateStr: string, refDate?: string): number {
  const target = new Date(dateStr)
  const ref = refDate ? new Date(refDate) : new Date()
  const diff = ref.getTime() - target.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * 날짜를 한국어로 포맷 ("3월 31일 (화)")
 */
export function formatDateKo(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const d = new Date(year, month - 1, day)
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
  return `${month}월 ${day}일 (${weekdays[d.getDay()]})`
}

/**
 * 시작/종료 시각으로 소요 시간 포맷 ("1시간 10분")
 */
export function formatDuration(startedAt: string, finishedAt: string): string {
  const start = new Date(startedAt).getTime()
  const end = new Date(finishedAt).getTime()
  const diffMin = Math.round((end - start) / 60000)
  if (diffMin < 60) return `${diffMin}분`
  const h = Math.floor(diffMin / 60)
  const m = diffMin % 60
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

/**
 * 초를 "MM:SS" 또는 "H:MM:SS"로 포맷
 */
export function formatSeconds(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
