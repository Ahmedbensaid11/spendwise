import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user) return <div className="loading-screen">Preparing your workspace…</div>
  return children
}
