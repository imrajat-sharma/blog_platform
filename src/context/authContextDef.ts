import { createContext } from 'react'
import type { User } from '../types'

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  authModalOpen: boolean
  authModalMode: 'login' | 'register'
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  openAuthModal: (mode?: 'login' | 'register') => void
  closeAuthModal: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

