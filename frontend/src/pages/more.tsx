import { Link } from "react-router-dom"
import { BookOpen, UserCircle, BarChart3, Users, Activity, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const MENU_ITEMS = [
  {
    to: "/library",
    icon: BookOpen,
    label: "운동 라이브러리",
    description: "운동 종목 검색 및 상세 정보",
  },
  {
    to: "/profile",
    icon: UserCircle,
    label: "프로필 설정",
    description: "신체 정보, 운동 목표, 장비 관리",
  },
  {
    to: "/partner",
    icon: Users,
    label: "파트너 설정",
    description: "파트너 운동 공유 및 연결 관리",
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
  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-4">
        <h1 className="text-xl font-bold">More</h1>
      </div>

      <div className="px-4">
        {MENU_ITEMS.map((item, idx) => (
          <div key={item.to}>
            {idx > 0 && <Separator />}
            <Link
              to={item.to}
              className="flex items-center gap-3 py-4 transition-colors hover:bg-muted/50 -mx-4 px-4 rounded-lg"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
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
