import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider, useAdmin } from './context/AdminContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function ProtectedRoute({ children }) {
  const { admin } = useAdmin()
  return admin ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { admin } = useAdmin()
  return !admin ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AppRoutes />
      </AdminProvider>
    </BrowserRouter>
  )
}