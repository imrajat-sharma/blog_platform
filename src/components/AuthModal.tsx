import React, { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { AlertCircle, Lock, Mail, User as UserIcon, X } from 'lucide-react'

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login, register, openAuthModal } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!authModalOpen) return null

  const isLogin = authModalMode === 'login'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name')
        }
        await register(name, email, password)
      }
      setName('')
      setEmail('')
      setPassword('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string) => {
    setError(null)
    setSubmitting(true)
    try {
      await login(demoEmail, 'password123')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Demo login failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="overlay" onClick={closeAuthModal}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={closeAuthModal} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="auth-brand">
          <span className="brand-text">inkwell</span>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={isLogin ? 'auth-tab active' : 'auth-tab'}
            onClick={() => {
              setError(null)
              openAuthModal('login')
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={!isLogin ? 'auth-tab active' : 'auth-tab'}
            onClick={() => {
              setError(null)
              openAuthModal('register')
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <label>
              Full Name
              <div className="input-wrapper">
                <UserIcon size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Maya Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </label>
          )}

          <label>
            Email Address
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          <label>
            Password
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          <button type="submit" className="publish auth-submit-btn" disabled={submitting}>
            {submitting ? 'Please wait...' : isLogin ? 'Sign In to Inkwell' : 'Create Account'}
          </button>
        </form>

        <div className="demo-accounts-section">
          <div className="demo-divider">
            <span>or instant demo sign in</span>
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoLogin('maya@example.com')}
              disabled={submitting}
            >
              Sign in as <strong>Maya Chen</strong> (Author)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleDemoLogin('alex@example.com')}
              disabled={submitting}
            >
              Sign in as <strong>Alex Morgan</strong> (Author)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
