import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'

// Chargées à la demande : Analyseur embarque le corpus Manulex complet
// (~450 Ko de JSON) via lib/manulex.js. Sans ce découpage, ce poids serait
// inclus dans le bundle de /login, chargé avant même qu'un enseignant soit
// connecté.
const Analyseur = lazy(() => import('./pages/Analyseur'))
const ReecritureIA = lazy(() => import('./pages/ReecritureIA'))
const Historique = lazy(() => import('./pages/Historique'))
const References = lazy(() => import('./pages/References'))

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
      <Suspense fallback={<div className="plai-empty" role="status">Chargement…</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Analyseur />} />
          <Route path="/reecriture" element={<ReecritureIA />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/references" element={<References />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
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
