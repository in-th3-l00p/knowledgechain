"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import api from "@/utils/api";

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.status === 200)
          setUser(response.data)
      } catch (error) {
        localStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth().then(() => {});
  }, [])
  
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const response = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('accessToken', response.data.accessToken)
      setUser(response.data.user)
      
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        await api.post('/api/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      
      setUser(null)
    }
  }
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
} 