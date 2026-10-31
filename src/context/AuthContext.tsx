import React, { useEffect, useState } from 'react'
import type { User } from '../types'
import { authAPI } from '../api/api'
import { AuthContext } from './authContextDef'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          setToken(storedToken)
          // Verify with server in background
          const me = await authAPI.getMe()
          setUser(me.user)
          localStorage.setItem('user', JSON.stringify(me.user))
        } catch {
          // Token expired or invalid
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    verifyUser()
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authAPI.login(email, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    setAuthModalOpen(false)
  }

  const register = async (name: string, email: string, password: string) => {
    const data = await authAPI.register(name, email, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    setAuthModalOpen(false)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setAuthModalOpen(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        authModalOpen,
        authModalMode,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
