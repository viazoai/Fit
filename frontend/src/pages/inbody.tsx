import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"

export default function InbodyPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col pb-8">
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold">인바디</h1>
        </div>
      </div>
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Phase 4에서 구현 예정이에요</p>
      </div>
    </div>
  )
}
