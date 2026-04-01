import { Link, useLocation } from "react-router-dom"
import { Home, Dumbbell, Calendar, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  icon: React.ElementType
  to: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Workout", icon: Dumbbell, to: "/workout" },
  { label: "Calendar", icon: Calendar, to: "/calendar" },
  { label: "More", icon: MoreHorizontal, to: "/settings" },
]

const MORE_PATHS = ["/settings", "/library", "/profile", "/report", "/partner", "/inbody"]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className={cn(
        "h-16 fixed bottom-0 left-0 right-0 z-50",
        "flex items-stretch",
        "border-t border-border bg-background"
      )}
    >
      {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
        const isActive =
          to === "/"
            ? pathname === "/"
            : to === "/settings"
            ? MORE_PATHS.some((p) => pathname.startsWith(p))
            : pathname.startsWith(to)

        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5",
              "text-xs font-medium transition-colors",
              "outline-none focus-visible:bg-muted",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-5" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
