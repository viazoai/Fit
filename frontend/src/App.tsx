import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { UserProvider, useCurrentUser } from "@/context/user-context"
import { ExerciseProvider } from "@/context/exercise-context"
import { WorkoutProvider } from "@/context/workout-context"
import { ToastProvider } from "@/context/toast-context"
import { PointsProvider } from "@/context/points-context"
import { ThemeProvider } from "@/context/theme-context"
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
import LoginPage from "@/pages/login"
import RegisterPage from "@/pages/register"

function AppContent() {
  const { currentUserId } = useCurrentUser()

  return (
    <AppShell currentUserId={currentUserId}>
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

function AuthGate() {
  const { ready, isAuthenticated } = useAuth()

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground text-sm">로딩 중...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <ExerciseProvider>
          <WorkoutProvider>
            <PointsProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </PointsProvider>
          </WorkoutProvider>
        </ExerciseProvider>
      </UserProvider>
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/*" element={<AuthGate />} />
      </Routes>
    </AuthProvider>
  )
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { ready, isAuthenticated } = useAuth()

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground text-sm">로딩 중...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
