import type { UserRead } from "@/types"

export const mockUsers: UserRead[] = [
  {
    id: 1,
    name: "형준",
    login_id: "hyungjun",
    is_admin: true,
    is_approved: true,
    theme: "dark",
    created_at: "2026-01-01T00:00:00",
  },
  {
    id: 2,
    name: "윤희",
    login_id: "yunhee",
    is_admin: false,
    is_approved: true,
    theme: "dark",
    created_at: "2026-01-01T00:00:00",
  },
]
