import { Routes, Route, Navigate } from "react-router-dom"
import { UserProvider, useCurrentUser } from "@/context/user-context"
import { WorkoutProvider } from "@/context/workout-context"
import { ToastProvider } from "@/context/toast-context"
import AppShell from "@/components/layout/AppShell"
import HomePage from "@/pages/home"
import WorkoutLogPage from "@/pages/workout-log"
import CalendarPage from "@/pages/calendar"
import LibraryPage from "@/pages/library"
import ProfilePage from "@/pages/profile"
import ReportPage from "@/pages/report"
import MorePage from "@/pages/more"
import PartnerPage from "@/pages/partner"
import InbodyPage from "@/pages/inbody"

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
        <Route path="/settings" element={<MorePage />} />
        <Route path="/partner" element={<PartnerPage />} />
        <Route path="/inbody" element={<InbodyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <UserProvider>
      <WorkoutProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </WorkoutProvider>
    </UserProvider>
  )
}
