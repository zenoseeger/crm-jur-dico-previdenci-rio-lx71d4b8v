import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User } from '@/types'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (name: string, email: string, pass: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('crm_auth_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('crm_auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && pass.length >= 6) {
          const loggedInUser: User = {
            id: 'u1',
            name: email.split('@')[0],
            email,
            role: 'Admin',
          }
          setUser(loggedInUser)
          localStorage.setItem('crm_auth_user', JSON.stringify(loggedInUser))
          resolve()
        } else {
          reject(
            new Error(
              'Credenciais inválidas. Use qualquer e-mail e senha com pelo menos 6 caracteres.',
            ),
          )
        }
      }, 800)
    })
  }

  const register = async (name: string, email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (name && email && pass.length >= 6) {
          const newUser: User = {
            id: `u${Date.now()}`,
            name,
            email,
            role: 'Admin',
          }
          setUser(newUser)
          localStorage.setItem('crm_auth_user', JSON.stringify(newUser))
          resolve()
        } else {
          reject(
            new Error('Preencha os campos corretamente. A senha deve ter no mínimo 6 caracteres.'),
          )
        }
      }, 800)
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('crm_auth_user')
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthStore must be used within AuthProvider')
  return context
}
