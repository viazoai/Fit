import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import type { Exercise } from "@/types"
import { getExercises } from "@/lib/api"
import { useAuth } from "@/context/auth-context"

interface ExerciseContextValue {
  exercises: Exercise[]
  loading: boolean
  /** exercise id → Exercise lookup (캐시) */
  getById: (id: number) => Exercise | undefined
  /** exercise name lookup by id */
  getName: (id: number) => string
  refresh: () => Promise<void>
}

const ExerciseContext = createContext<ExerciseContextValue | null>(null)

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const { ready } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [map, setMap] = useState<Map<number, Exercise>>(new Map())

  async function load() {
    try {
      const data = await getExercises()
      setExercises(data)
      setMap(new Map(data.map((e) => [e.id, e])))
    } catch (err) {
      console.error("운동 목록 로드 실패:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ready) load()
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  function getById(id: number) {
    return map.get(id)
  }

  function getName(id: number) {
    return map.get(id)?.name ?? `#${id}`
  }

  return (
    <ExerciseContext value={{ exercises, loading, getById, getName, refresh: load }}>
      {children}
    </ExerciseContext>
  )
}

export function useExercises(): ExerciseContextValue {
  const ctx = useContext(ExerciseContext)
  if (!ctx) throw new Error("useExercises must be used within ExerciseProvider")
  return ctx
}
