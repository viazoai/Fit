import { createContext, useContext, type ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import type { UserRead } from "@/types"

interface UserContextValue {
  currentUser: UserRead
  currentUserId: number
}

const fallbackUser: UserRead = {
  id: 0,
  name: "...",
  login_id: "",
  is_admin: false,
  is_approved: false,
  theme: "dark",
  created_at: "",
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const currentUser = user ?? fallbackUser

  return (
    <UserContext value={{ currentUser, currentUserId: currentUser.id }}>
      {children}
    </UserContext>
  )
}

export function useCurrentUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useCurrentUser must be used within UserProvider")
  return ctx
}
