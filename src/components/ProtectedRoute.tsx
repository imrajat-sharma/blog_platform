import React from 'react'
import { useAuth } from '../context/useAuth'
import { Lock, LogIn } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallbackMessage?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackMessage = 'You must be signed in to access this page.',
}) => {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth()

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
        <p>Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="protected-fallback">
        <div className="protected-card">
          <div className="icon-badge">
            <Lock size={28} />
          </div>
          <h2>Authentication Required</h2>
          <p>{fallbackMessage}</p>
          <button className="dark-cta" onClick={() => openAuthModal('login')}>
            <LogIn size={16} /> Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
