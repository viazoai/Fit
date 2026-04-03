import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { updateMe } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import type { ThemeMode } from "@/types"

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
})

function getSystemDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function applyThemeClass(mode: ThemeMode) {
  const isDark = mode === "dark" || (mode === "system" && getSystemDark())
  document.documentElement.classList.toggle("dark", isDark)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [theme, setThemeState] = useState<ThemeMode>(() => user?.theme ?? "dark")

  // user가 바뀌면 (로그인/전환) 테마 동기화
  useEffect(() => {
    if (user?.theme) {
      setThemeState(user.theme)
    }
  }, [user?.theme])

  // 테마 변경 시 html class 반영
  useEffect(() => {
    applyThemeClass(theme)
  }, [theme])

  // system 모드일 때 OS 테마 변경 감지
  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyThemeClass("system")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeState(mode)
      applyThemeClass(mode)
      // 서버에 저장 (fire-and-forget)
      updateMe({ theme: mode }).catch(() => {})
    },
    [],
  )

  return (
    <ThemeContext value={{ theme, setTheme }}>
      {children}
    </ThemeContext>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
