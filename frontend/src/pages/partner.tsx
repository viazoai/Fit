import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useCurrentUser } from "@/context/user-context"
import { mockUsers } from "@/mocks"

export default function PartnerPage() {
  const navigate = useNavigate()
  const { currentUser } = useCurrentUser()

  // 현재 사용자가 아닌 나머지 사용자를 파트너로 표시
  const partner = mockUsers.find((u) => u.id !== currentUser.id) ?? null

  return (
    <div className="flex flex-col pb-8">
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-[30px] font-bold">파트너 설정</h1>
        </div>
      </div>

      <div className="px-4">
        {partner ? (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Avatar name={partner.name} size="lg" />
                <div>
                  <p className="text-sm font-semibold">{partner.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      파트너 운동 공유 중
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">연결된 파트너가 없어요</p>
          </div>
        )}
      </div>
    </div>
  )
}
