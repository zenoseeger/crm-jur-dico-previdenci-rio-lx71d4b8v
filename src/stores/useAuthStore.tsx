import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User } from '@/types'

interface RegisteredUser extends User {
  passwordHash: string
  isVerified: boolean
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (name: string, email: string, pass: string) => Promise<void>
  verifyRegistration: (email: string, code: string) => Promise<void>
  resendRegistrationCode: (email: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

const getStoredUsers = (): RegisteredUser[] => {
  const stored = localStorage.getItem('crm_registered_users')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {}
  }
  return [
    {
      id: 'u_admin',
      name: 'Administrador',
      email: 'admin@escritorio.com',
      role: 'Admin',
      passwordHash: 'Admin123',
      isVerified: true,
    },
  ]
}

const saveStoredUsers = (users: RegisteredUser[]) => {
  localStorage.setItem('crm_registered_users', JSON.stringify(users))
}

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
    const users = getStoredUsers()
    saveStoredUsers(users)
    setIsLoading(false)
  }, [])

  const login = async (email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users = getStoredUsers()
        const found = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === pass,
        )

        if (!found) {
          reject(new Error('Invalid credentials'))
          return
        }

        if (!found.isVerified) {
          reject(new Error('Please verify your email to continue.'))
          return
        }

        const loggedInUser: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
        }
        setUser(loggedInUser)
        localStorage.setItem('crm_auth_user', JSON.stringify(loggedInUser))
        resolve()
      }, 800)
    })
  }

  const register = async (name: string, email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users = getStoredUsers()
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
          reject(new Error('Email already registered.'))
          return
        }

        const newUser: RegisteredUser = {
          id: `u${Date.now()}`,
          name,
          email,
          role: 'Admin',
          passwordHash: pass,
          isVerified: false,
        }

        users.push(newUser)
        saveStoredUsers(users)
        resolve()
      }, 800)
    })
  }

  const verifyRegistration = async (email: string, code: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (code !== '123456') {
          reject(new Error('Código de verificação inválido.'))
          return
        }

        const users = getStoredUsers()
        const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
        if (userIndex === -1) {
          reject(new Error('Usuário não encontrado.'))
          return
        }

        users[userIndex].isVerified = true
        saveStoredUsers(users)

        const loggedInUser: User = {
          id: users[userIndex].id,
          name: users[userIndex].name,
          email: users[userIndex].email,
          role: users[userIndex].role,
        }
        setUser(loggedInUser)
        localStorage.setItem('crm_auth_user', JSON.stringify(loggedInUser))
        resolve()
      }, 800)
    })
  }

  const resendRegistrationCode = async (email: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && email.includes('@')) {
          resolve()
        } else {
          reject(new Error('E-mail inválido.'))
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
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyRegistration,
        resendRegistrationCode,
        logout,
      }}
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
