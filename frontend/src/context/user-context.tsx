import { createContext, useContext, useState, type ReactNode } from "react"
import type { User } from "@/types"
import { mockUsers } from "@/mocks"

type UserId = "user-1" | "user-2"

interface UserContextValue {
  currentUser: User
  partner: User
  currentUserId: UserId
  switchUser: () => void
  updateUser: (updates: Partial<User>) => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [currentUserId, setCurrentUserId] = useState<UserId>("user-1")

  const currentUser = users.find((u) => u.id === currentUserId) ?? users[0]
  const partner = users.find((u) => u.id !== currentUserId) ?? users[1]

  function switchUser() {
    setCurrentUserId((prev) => (prev === "user-1" ? "user-2" : "user-1"))
  }

  function updateUser(updates: Partial<User>) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUserId ? { ...u, ...updates } : u
      )
    )
  }

  return (
    <UserContext value={{ currentUser, partner, currentUserId, switchUser, updateUser }}>
      {children}
    </UserContext>
  )
}

export function useCurrentUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useCurrentUser must be used within UserProvider")
  return ctx
}
