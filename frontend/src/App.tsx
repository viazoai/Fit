import { Routes, Route, Navigate } from "react-router-dom"
import HomePage from "@/pages/home"
import WorkoutLogPage from "@/pages/workout-log"
import CalendarPage from "@/pages/calendar"
import LibraryPage from "@/pages/library"
import ProfilePage from "@/pages/profile"
import ReportPage from "@/pages/report"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/workout" element={<WorkoutLogPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
