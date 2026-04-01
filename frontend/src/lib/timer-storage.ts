const KEY = "fit-active-timer"

interface TimerData {
  startedAt: number
  pausedAt: number | null
  totalPausedMs: number
}

function readData(): TimerData | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as TimerData
  } catch {
    return null
  }
}

export function startTimer(): void {
  const data: TimerData = { startedAt: Date.now(), pausedAt: null, totalPausedMs: 0 }
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function pauseTimer(): void {
  const data = readData()
  if (!data || data.pausedAt !== null) return
  data.pausedAt = Date.now()
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function resumeTimer(): void {
  const data = readData()
  if (!data || data.pausedAt === null) return
  data.totalPausedMs += Date.now() - data.pausedAt
  data.pausedAt = null
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getElapsedMs(): number {
  const data = readData()
  if (!data) return 0
  const now = data.pausedAt ?? Date.now()
  return now - data.startedAt - data.totalPausedMs
}

export function isPaused(): boolean {
  const data = readData()
  return data?.pausedAt !== null && data?.pausedAt !== undefined
}

export function hasActiveTimer(): boolean {
  return localStorage.getItem(KEY) !== null
}

export function clearTimer(): void {
  localStorage.removeItem(KEY)
}
