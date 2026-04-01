# 개발 핸드오프 — WU-5 로깅 강화

> 작성일: 2026-04-01
> 목적: 다음 Claude 세션에서 WU-5 작업을 이어서 진행하기 위한 컨텍스트 문서

---

## 현재 상태 요약

Phase 1.5-1 UI/UX 개선 작업 중 **WU-5만 미완료**.  
WU-1~WU-4, WU-6은 모두 완료되어 TypeScript 오류 없이 빌드됨.

---

## 미완료 작업: WU-5 — 로깅 강화 [L]

### G. 운동 중 종목 추가/삭제

**목표:** 운동 진행 중에 종목을 추가하거나 탭에서 삭제할 수 있도록

**수정 대상:** `src/components/workout/LoggingStep.tsx`

**구현 사항:**
1. `exercises` prop → 내부 `state`로 전환:
   ```ts
   const [currentExercises, setCurrentExercises] = useState<Exercise[]>(exercises)
   const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(
     () => exercises.map((e) => ({ exerciseId: e.id, sets: [] }))
   )
   ```

2. 운동 탭 바 끝에 `+` 버튼 추가 → `showPicker` state로 Dialog 열기:
   - Dialog 내부에 `SelectExercisesStep`에서 쓰는 것과 동일한 운동 선택 UI 삽입
   - 혹은 간단한 inline 목록으로 구현해도 무방
   - Dialog 확인 시 선택한 운동을 `currentExercises`와 `activeExercises`에 append

3. 각 탭에 `×` 삭제 버튼 추가:
   - `currentExercises.length > 1`일 때만 표시 (최소 1개 유지)
   - 삭제 시 해당 인덱스 제거 후 `currentIndex`가 범위를 벗어나면 조정:
     ```ts
     setCurrentIndex((prev) => Math.min(prev, newExercises.length - 1))
     ```

**관련 파일:**
- `src/components/workout/LoggingStep.tsx` — 주 수정 대상
- `src/components/workout/SelectExercisesStep.tsx` — Dialog 내 재사용 검토
- `src/components/ui/dialog.tsx` — 이미 존재

---

### H. 과거 운동 기록 기반 자동 입력

**목표:** 해당 운동의 가장 최근 세션 기록에서 마지막 세트를 읽어 초기값 자동 채움

**수정 대상:** `src/components/workout/LoggingStep.tsx`

**현재 동작:**
```ts
// 현재: 현재 세션의 마지막 세트에서만 채움
useEffect(() => {
  const lastSet = activeExercises[currentIndex]?.sets.at(-1)
  if (lastSet) {
    setWeightKg(String(lastSet.weightKg))
    setRpe(lastSet.rpe)
  }
}, [currentIndex])
```

**개선 방향:**
1. `useWorkouts()`, `useCurrentUser()` 훅은 이미 LoggingStep 내부에서 import됨  
   (`currentUserId`는 이미 사용 중)

2. 헬퍼 함수 추가 (파일 상단 또는 별도 util):
   ```ts
   function getLastHistoricalSet(
     exerciseId: string,
     workouts: WorkoutSession[],
     userId: string
   ): { weightKg: number; reps: number; rpe: number } | null {
     const sessions = workouts
       .filter((w) => w.userId === userId && w.sets.some((s) => s.exerciseId === exerciseId))
       .sort((a, b) => b.date.localeCompare(a.date))
     const lastSession = sessions[0]
     if (!lastSession) return null
     const sets = lastSession.sets.filter((s) => s.exerciseId === exerciseId)
     const lastSet = sets.at(-1)
     if (!lastSet) return null
     return { weightKg: lastSet.weightKg, reps: lastSet.reps, rpe: lastSet.rpe ?? 7 }
   }
   ```

3. `useEffect` 수정 — 현재 세션에 세트가 없을 때만 과거 기록에서 채움:
   ```ts
   useEffect(() => {
     const lastSet = activeExercises[currentIndex]?.sets.at(-1)
     if (lastSet) {
       setWeightKg(String(lastSet.weightKg))
       setRpe(lastSet.rpe)
     } else {
       // 현재 세션 세트 없으면 과거 기록에서 채움
       const hist = getLastHistoricalSet(
         currentExercise.id, workouts, currentUserId
       )
       if (hist) {
         setWeightKg(String(hist.weightKg))
         setReps(String(hist.reps))
         setRpe(hist.rpe)
       }
     }
   }, [currentIndex])
   ```

**필요한 추가 import:**
```ts
import { useWorkouts } from "@/context/workout-context"
import type { WorkoutSession } from "@/types"
```
> `useWorkouts`와 `useCurrentUser`는 이미 import 되어 있으므로 `WorkoutSession` 타입만 추가하면 됨

---

### J. 타이머 영속성 + 일시정지

**목표:** 페이지 새로고침/앱 종료 후에도 운동 시간이 유지, 일시정지 가능

#### J-1. `src/lib/timer-storage.ts` 생성

```ts
const KEY = "fit-active-timer"

interface TimerData {
  startedAt: number      // Date.now() ms
  pausedAt: number | null
  totalPausedMs: number
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

function readData(): TimerData | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as TimerData }
  catch { return null }
}
```

#### J-2. `LoggingStep.tsx` 타이머 로직 교체

**현재 코드 위치:** `src/components/workout/LoggingStep.tsx` — `useEffect` 타이머 부분

**변경 사항:**
1. 기존 `setInterval` 카운터 방식 → `timer-storage` 기반으로 교체
2. `isPaused` state 추가
3. Pause/Play 토글 버튼 추가 (타이머 옆)
4. 완료 시 `clearTimer()` 호출

```ts
// 추가 import
import { startTimer, pauseTimer, resumeTimer, getElapsedMs, isPaused as getIsPaused, hasActiveTimer, clearTimer } from "@/lib/timer-storage"

// state 추가
const [paused, setPaused] = useState(false)

// useEffect 교체
useEffect(() => {
  if (!hasActiveTimer()) {
    startTimer()
  } else {
    // 기존 타이머 복원
    setPaused(getIsPaused())
  }

  intervalRef.current = setInterval(() => {
    if (!getIsPaused()) {
      setElapsedSec(Math.floor(getElapsedMs() / 1000))
    }
  }, 1000)

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }
}, [])

// 토글 함수
function togglePause() {
  if (paused) {
    resumeTimer()
    setPaused(false)
  } else {
    pauseTimer()
    setPaused(true)
  }
}

// handleComplete에 clearTimer 추가
function handleComplete() {
  if (intervalRef.current) clearInterval(intervalRef.current)
  clearTimer()
  onComplete(activeExercises, elapsedSec)
}
```

**타이머 UI (헤더 영역에 Pause 버튼 추가):**
```tsx
<div className="flex items-center gap-2 text-muted-foreground">
  <Timer className="size-4" />
  <span className="text-sm font-mono font-medium">{formatSeconds(elapsedSec)}</span>
  <button onClick={togglePause} className="ml-1 text-muted-foreground hover:text-foreground">
    {paused
      ? <Play className="size-3.5" />
      : <Pause className="size-3.5" />
    }
  </button>
</div>
```
> `Play`, `Pause` 아이콘 lucide-react에서 import 추가 필요

---

## 작업 완료 기준 (WU-5)

- [ ] 운동 중 탭 바에 `+` 버튼 표시 → Dialog로 운동 선택 → 탭에 추가
- [ ] 탭에 `×` 버튼 표시 (최소 1개일 때 숨김) → 탭 + 기록 삭제
- [ ] 처음 운동 선택 시 (현재 세션 세트 없음 + 과거 기록 있음) 무게/횟수/RPE 자동 채움
- [ ] `npm run dev` 후 운동 시작 → 새로고침 → 타이머 시간 유지
- [ ] Pause 버튼으로 타이머 일시정지, Play 버튼으로 재개
- [ ] 운동 완료 후 localStorage `fit-active-timer` 키 삭제됨

---

## 관련 파일 경로

```
frontend/src/
├── components/workout/
│   ├── LoggingStep.tsx        ← 주 수정 파일 (G, H, J-2)
│   └── SelectExercisesStep.tsx ← Dialog 내 재사용 검토
├── lib/
│   └── timer-storage.ts       ← 신규 생성 (J-1)
└── context/
    ├── workout-context.tsx    ← workouts 데이터 (H에서 읽기용)
    └── user-context.tsx       ← currentUserId (H에서 읽기용)
```

---

## 앱 실행 방법

```bash
cd /home/zoai/Projects/Fit/frontend
npm run dev
# → http://localhost:5173
```

TypeScript 검증:
```bash
npx tsc --noEmit
# 출력 없으면 정상
```
