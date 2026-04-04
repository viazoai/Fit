import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await login(loginId, password)
      navigate("/", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Dumbbell className="size-7 text-primary" />
            <h1 className="text-3xl font-semibold tracking-tight">Fit</h1>
          </div>
          <p className="text-sm text-muted-foreground">AI 피트니스 에이전트</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">아이디</label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
              autoComplete="username"
              className="h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              autoComplete="current-password"
              className="h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          계정이 없으신가요?{" "}
          <Link to="/register" className="underline hover:text-foreground transition-colors">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
