import { Routes, Route, Navigate } from "react-router-dom"
import { UserProvider, useCurrentUser } from "@/context/user-context"
import { WorkoutProvider } from "@/context/workout-context"
import { ToastProvider } from "@/context/toast-context"
import { PointsProvider } from "@/context/points-context"
import AppShell from "@/components/layout/AppShell"
import HomePage from "@/pages/home"
import LogPage from "@/pages/log"
import WorkoutLogPage from "@/pages/workout-log"
import ShopPage from "@/pages/shop"
import ShopInventoryPage from "@/pages/shop-inventory"
import ShopHistoryPage from "@/pages/shop-history"
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
        <Route path="/log" element={<LogPage />} />
        <Route path="/workout" element={<WorkoutLogPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/inventory" element={<ShopInventoryPage />} />
        <Route path="/shop/history" element={<ShopHistoryPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/partner" element={<PartnerPage />} />
        <Route path="/inbody" element={<InbodyPage />} />
        {/* 구 경로 리다이렉트 */}
        <Route path="/calendar" element={<Navigate to="/log" replace />} />
        <Route path="/settings" element={<Navigate to="/more" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <UserProvider>
      <WorkoutProvider>
        <PointsProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </PointsProvider>
      </WorkoutProvider>
    </UserProvider>
  )
}
