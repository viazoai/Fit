import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Dumbbell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { register } from "@/lib/api"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await register(name, loginId, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center flex flex-col gap-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Check className="size-6" />
          </div>
          <h2 className="text-lg font-semibold">가입 신청 완료</h2>
          <p className="text-sm text-muted-foreground">
            관리자가 계정을 승인하면 로그인할 수 있습니다.
          </p>
          <Button onClick={() => navigate("/login")}>로그인 화면으로</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Dumbbell className="size-7 text-primary" />
            <h1 className="text-3xl font-semibold tracking-tight">Fit</h1>
          </div>
          <p className="text-sm text-muted-foreground">회원가입</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="표시될 이름"
              required
              className="h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">아이디</label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="로그인에 사용할 아이디"
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
              placeholder="비밀번호"
              required
              autoComplete="new-password"
              className="h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading ? "신청 중..." : "가입 신청"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="underline hover:text-foreground transition-colors">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
