import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import {
  login as apiLogin,
  getMe,
  getToken,
  clearToken,
} from "@/lib/api"
import type { UserRead } from "@/types"

interface AuthContextValue {
  user: UserRead | null
  ready: boolean
  isAuthenticated: boolean
  login: (loginId: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  ready: false,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRead | null>(null)
  const [ready, setReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function init() {
      if (getToken()) {
        try {
          const me = await getMe()
          setUser(me)
          setIsAuthenticated(true)
        } catch {
          clearToken()
        }
      }
      setReady(true)
    }
    init()
  }, [])

  const login = useCallback(async (loginId: string, password: string) => {
    const res = await apiLogin(loginId, password)
    setUser(res.user)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext value={{ user, ready, isAuthenticated, login, logout }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
