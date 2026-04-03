import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { login as apiLogin, getMe, getToken, clearToken } from "@/lib/api"
import type { UserRead } from "@/types"

interface AuthContextValue {
  user: UserRead | null
  ready: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, ready: false })

/**
 * Phase 3 임시 인증: 앱 시작 시 자동으로 형준/1234 로그인.
 * 로그인 UI는 추후 Phase에서 추가 예정.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRead | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        // 이미 토큰이 있으면 검증
        if (getToken()) {
          try {
            const me = await getMe()
            setUser(me)
            setReady(true)
            return
          } catch {
            clearToken()
          }
        }
        // 자동 로그인
        const res = await apiLogin("형준", "1234")
        setUser(res.user as UserRead)
      } catch (err) {
        console.error("자동 로그인 실패:", err)
      } finally {
        setReady(true)
      }
    }
    init()
  }, [])

  return (
    <AuthContext value={{ user, ready }}>
      {children}
    </AuthContext>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
