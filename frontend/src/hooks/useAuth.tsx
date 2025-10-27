'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  credits: number
  is_admin?: boolean
  created_at?: string
}

interface AuthContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = 'http://localhost:8000'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      refreshUser()
    }
  }, [])

  const refreshUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/users/me`)
      setCurrentUser(response.data)
    } catch (error) {
      console.log('User not authenticated')
      setCurrentUser(null)
      localStorage.removeItem('access_token')
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
        email,
        password
      })

      const { access_token, user } = response.data
      localStorage.setItem('access_token', access_token)
      setCurrentUser(user)

      return { success: true }
    } catch (error: any) {
      console.error('Login failed:', error)
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      isLoading,
      login,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}