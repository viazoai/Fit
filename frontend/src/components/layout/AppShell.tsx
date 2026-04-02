import { useEffect, useState, type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import Header from "./Header"
import BottomNav from "./BottomNav"

const BG_STORAGE_KEY = "fit-home-bg"
const DEFAULT_BG = "/home-bg.jpg"

interface AppShellProps {
  children: ReactNode
  currentUserId?: string
  onUserSwitch?: () => void
}

export default function AppShell({
  children,
  currentUserId,
  onUserSwitch,
}: AppShellProps) {
  const location = useLocation()
  const isHome = location.pathname === "/"

  const [homeBg, setHomeBg] = useState<string | null>(
    () => localStorage.getItem(BG_STORAGE_KEY) ?? DEFAULT_BG
  )

  useEffect(() => {
    const handler = () =>
      setHomeBg(localStorage.getItem(BG_STORAGE_KEY) ?? DEFAULT_BG)
    window.addEventListener("fit-home-bg-changed", handler)
    return () => window.removeEventListener("fit-home-bg-changed", handler)
  }, [])

  return (
    <div className="flex flex-col min-h-svh bg-background">
      {/* 홈 배경 이미지 — 애니메이션 바깥에 위치해 페이지 전환과 무관하게 유지 */}
      {isHome && homeBg && (
        <div
          className="fixed inset-x-0 top-0 h-[360px] pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <img
            src={homeBg}
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-top"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(15,15,15,0.65) 0%, rgba(15,15,15,0.2) 22%, rgba(15,15,15,0.6) 48%, rgba(15,15,15,0.93) 62%, rgba(15,15,15,1) 78%)",
            }}
          />
        </div>
      )}

      <Header currentUserId={currentUserId} onUserSwitch={onUserSwitch} transparent={isHome} />
      <main className="flex-1 overflow-y-auto pb-20">
        <div
          key={location.pathname}
          className="animate-in fade-in-0 duration-200"
        >
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
