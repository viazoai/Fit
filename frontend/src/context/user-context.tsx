import { createContext, useContext, useState, type ReactNode } from "react"
import type { User } from "@/types"
import { mockUsers } from "@/mocks"

type UserId = "user-1" | "user-2"

interface UserContextValue {
  currentUser: User
  partner: User
  currentUserId: UserId
  switchUser: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<UserId>("user-1")

  const currentUser =
    mockUsers.find((u) => u.id === currentUserId) ?? mockUsers[0]
  const partner =
    mockUsers.find((u) => u.id !== currentUserId) ?? mockUsers[1]

  function switchUser() {
    setCurrentUserId((prev) => (prev === "user-1" ? "user-2" : "user-1"))
  }

  return (
    <UserContext value={{ currentUser, partner, currentUserId, switchUser }}>
      {children}
    </UserContext>
  )
}

export function useCurrentUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useCurrentUser must be used within UserProvider")
  return ctx
}
