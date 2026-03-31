import { Routes, Route, Navigate } from "react-router-dom"
import { UserProvider, useCurrentUser } from "@/context/user-context"
import AppShell from "@/components/layout/AppShell"
import HomePage from "@/pages/home"
import WorkoutLogPage from "@/pages/workout-log"
import CalendarPage from "@/pages/calendar"
import LibraryPage from "@/pages/library"
import ProfilePage from "@/pages/profile"
import ReportPage from "@/pages/report"

function AppContent() {
  const { currentUserId, switchUser } = useCurrentUser()

  return (
    <AppShell currentUserId={currentUserId} onUserSwitch={switchUser}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/workout" element={<WorkoutLogPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/settings" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}
