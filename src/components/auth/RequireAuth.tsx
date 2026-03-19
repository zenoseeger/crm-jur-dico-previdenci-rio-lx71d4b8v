import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { Loader2 } from 'lucide-react'

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Sanitize the return URL to prevent wildcard or incorrectly formatted path navigation errors
    const isInvalidPath = location.pathname.includes('*') || location.pathname === '/*'
    const returnPath = isInvalidPath ? '/dashboard' : location.pathname

    return <Navigate to="/login" state={{ from: { pathname: returnPath } }} replace />
  }

  return children
}
