import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Analyseur from './pages/Analyseur'
import ReecritureIA from './pages/ReecritureIA'
import Historique from './pages/Historique'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="plai-empty">Chargement…</div>
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Analyseur />} />
        <Route path="/reecriture" element={<ReecritureIA />} />
        <Route path="/historique" element={<Historique />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
