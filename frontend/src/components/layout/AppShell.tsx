import type { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import Header from "./Header"
import BottomNav from "./BottomNav"
import FloatingActionButton from "./FloatingActionButton"

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

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <Header currentUserId={currentUserId} onUserSwitch={onUserSwitch} />
      <main className="flex-1 overflow-y-auto pb-20">
        <div
          key={location.pathname}
          className="animate-in fade-in-0 duration-200"
        >
          {children}
        </div>
      </main>
      <FloatingActionButton />
      <BottomNav />
    </div>
  )
}
