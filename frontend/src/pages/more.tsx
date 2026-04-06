import { Link } from "react-router-dom"
import { BookOpen, UserCircle, BarChart3, Users, Activity, ChevronRight, Monitor, Sun, Moon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/theme-context"
import type { ThemeMode } from "@/types"

const THEME_OPTIONS: { value: ThemeMode; icon: typeof Monitor; label: string }[] = [
  { value: "system", icon: Monitor, label: "시스템" },
  { value: "light", icon: Sun, label: "라이트" },
  { value: "dark", icon: Moon, label: "다크" },
]

const MENU_ITEMS = [
  {
    to: "/library",
    icon: BookOpen,
    label: "운동 라이브러리",
    description: "운동 종목 검색, 추가, 편집",
  },
  {
    to: "/profile",
    icon: UserCircle,
    label: "프로필 설정",
    description: "신체 정보, 운동 목표, 장비 관리",
    badge: "준비 중",
  },
  {
    to: "/partner",
    icon: Users,
    label: "파트너 설정",
    description: "파트너 운동 공유 및 연결 관리",
    badge: "준비 중",
  },
  {
    to: "/inbody",
    icon: Activity,
    label: "인바디",
    description: "체성분 분석 및 기록",
    badge: "준비 중",
  },
  {
    to: "/report",
    icon: BarChart3,
    label: "리포트",
    description: "운동 분석 및 AI 인사이트",
    badge: "준비 중",
  },
]

export default function MorePage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-4">
        <h1 className="text-2xl font-bold">More</h1>
      </div>

      {/* 화면 설정 */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-3 py-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-card border border-border">
            <Monitor className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">화면 설정</p>
            <p className="text-xs text-muted-foreground mt-0.5">테마 모드 선택</p>
          </div>
          <div className="relative flex items-center rounded-lg bg-secondary p-1">
            {/* 슬라이딩 필 */}
            <div
              className="absolute top-1 bottom-1 w-[56px] rounded-md bg-card border border-border shadow-sm transition-all duration-200 ease-in-out"
              style={{
                left: `calc(4px + ${THEME_OPTIONS.findIndex((o) => o.value === theme)} * 56px)`,
              }}
            />
            {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "relative z-10 flex w-[56px] items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-medium transition-colors duration-200",
                  theme === value ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3" />
                {label}
              </button>
            ))}
          </div>
        </div>
        <Separator />
      </div>

      <div className="px-4">
        {MENU_ITEMS.map((item, idx) => (
          <div key={item.to}>
            {idx > 0 && <Separator />}
            <Link
              to={item.to}
              className="flex items-center gap-3 py-4 transition-colors hover:bg-muted/50 -mx-4 px-4 rounded-lg"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-card border border-border">
                <item.icon className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground shrink-0" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
