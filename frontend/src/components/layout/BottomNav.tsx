import { Link, useLocation } from "react-router-dom"
import { Home, ClipboardList, Flame, ShoppingBag, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  center?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Log", icon: ClipboardList, to: "/log" },
  { label: "Workout", icon: Flame, to: "/workout", center: true },
  { label: "Shop", icon: ShoppingBag, to: "/shop" },
  { label: "More", icon: MoreHorizontal, to: "/more" },
]

const MORE_PATHS = ["/more", "/library", "/profile", "/report", "/partner", "/inbody"]

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
      {NAV_ITEMS.map(({ label, icon: Icon, to, center }) => {
        const isActive =
          to === "/"
            ? pathname === "/"
            : to === "/more"
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
            {center ? (
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-full transition-colors",
                  isActive ? "bg-accent-heat" : "bg-accent-heat/15"
                )}
              >
                <Icon className={cn("size-6", isActive ? "text-white" : "text-accent-heat")} />
              </div>
            ) : (
              <>
                <Icon className="size-5" />
                <span>{label}</span>
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
