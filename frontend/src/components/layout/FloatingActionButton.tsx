import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { useWorkouts } from "@/context/workout-context"

export default function FloatingActionButton() {
  const navigate = useNavigate()
  const { isWorkoutActive } = useWorkouts()

  if (isWorkoutActive) return null

  return (
    <button
      onClick={() => navigate("/workout", { state: { startWorkout: true } })}
      aria-label="운동 시작"
      className="fixed bottom-24 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
    >
      <Plus className="size-6" />
    </button>
  )
}
