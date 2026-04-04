import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useCurrentUser } from "@/context/user-context"
import { getPendingUsers, approveUser, rejectUser } from "@/lib/api"
import { useToast } from "@/context/toast-context"

interface PendingUser {
  id: number
  name: string
  login_id: string
  created_at: string
}

export default function ProfilePopover() {
  const { logout } = useAuth()
  const { currentUser } = useCurrentUser()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownTop, setDropdownTop] = useState(0)

  useEffect(() => {
    if (open && currentUser.is_admin) {
      setLoadingUsers(true)
      getPendingUsers()
        .then(setPendingUsers)
        .catch(() => {})
        .finally(() => setLoadingUsers(false))
    }
  }, [open, currentUser.is_admin])

  useEffect(() => {
    if (!open) return
    const header = document.querySelector("header")
    if (header) {
      setDropdownTop(header.getBoundingClientRect().bottom)
    }
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (containerRef.current?.contains(target)) return
      if (dropdownRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const handleApprove = async (userId: number) => {
    try {
      await approveUser(userId)
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
      toast("승인되었습니다")
    } catch {
      toast("승인에 실패했습니다")
    }
  }

  const handleReject = async (userId: number) => {
    try {
      await rejectUser(userId)
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
      toast("거절되었습니다")
    } catch {
      toast("거절에 실패했습니다")
    }
  }

  const dropdown = open
    ? createPortal(
        <div
          ref={dropdownRef}
          className="fixed right-4 z-50 w-72 rounded-xl bg-card text-card-foreground shadow-xl border border-border overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150"
          style={{ top: `${dropdownTop + 8}px` }}
        >
          {/* 프로필 */}
          <div className="flex items-center gap-3 px-4 py-4">
            <Avatar name={currentUser.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">@{currentUser.login_id}</p>
            </div>
            {currentUser.is_admin && (
              <span className="text-[10px] font-medium bg-primary/15 text-primary px-2 py-0.5 rounded-full shrink-0">
                관리자
              </span>
            )}
          </div>

          {/* 관리자: 가입 승인 대기 */}
          {currentUser.is_admin && (
            <div className="mx-4 mb-3 rounded-lg bg-muted/60 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                가입 승인 대기
                {pendingUsers.length > 0 && (
                  <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                    {pendingUsers.length}
                  </span>
                )}
              </p>
              {loadingUsers ? (
                <p className="text-xs text-muted-foreground">불러오는 중...</p>
              ) : pendingUsers.length === 0 ? (
                <p className="text-xs text-muted-foreground">대기 중인 신청 없음</p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  {pendingUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-2 p-2 rounded-lg bg-card">
                      <Avatar name={u.name} size="sm" className="size-7 text-xs" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">@{u.login_id}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="text-[10px] font-medium px-2 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleReject(u.id)}
                          className="text-[10px] font-medium px-2 py-1 rounded-md border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 로그아웃 */}
          <div className="px-4 pb-4 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center rounded-xl bg-muted hover:bg-muted/60 transition-colors py-2.5 text-xs font-medium"
            >
              로그아웃
            </button>
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 hover:opacity-80 transition-opacity rounded-full"
      >
        <Avatar name={currentUser.name} size="sm" />
      </button>
      {dropdown}
    </div>
  )
}
