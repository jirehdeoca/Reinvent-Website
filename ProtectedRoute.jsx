import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children, requireAdmin = false, requireCoach = false }) {
  const { user, profile, loading, isAdmin, isCoach } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  // Check coach requirement
  if (requireCoach && !isCoach()) {
    return <Navigate to="/dashboard" replace />
  }

  // Render children if all checks pass
  return children
}

export default ProtectedRoute

