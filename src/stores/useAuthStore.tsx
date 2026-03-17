import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User } from '@/types'

interface RegisteredUser extends User {
  passwordHash: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (name: string, email: string, pass: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

const saveStoredUsers = (users: RegisteredUser[]) => {
  localStorage.setItem('crm_registered_users', JSON.stringify(users))
}

const getStoredUsers = (): RegisteredUser[] => {
  const stored = localStorage.getItem('crm_registered_users')
  let users: RegisteredUser[] = []

  if (stored) {
    try {
      users = JSON.parse(stored)
    } catch (e) {
      // ignore parsing error
    }
  }

  const defaultAdmins: RegisteredUser[] = [
    {
      id: 'u_admin_zh',
      name: 'Administrador ZH',
      email: 'zhseeger@gmail.com',
      role: 'Admin',
      passwordHash: 'trip7*2017',
    },
    {
      id: 'u_admin',
      name: 'Administrador',
      email: 'admin@escritorio.com',
      role: 'Admin',
      passwordHash: 'Admin123',
    },
  ]

  let updated = false
  defaultAdmins.forEach((admin) => {
    if (!users.some((u) => u.email.toLowerCase() === admin.email.toLowerCase())) {
      users.push(admin)
      updated = true
    }
  })

  if (updated) {
    saveStoredUsers(users)
  }

  return users
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
        const cleanEmail = email.trim().toLowerCase()

        // Administrative Login Override
        if (cleanEmail === 'zhseeger@gmail.com') {
          if (pass === 'trip7*2017') {
            const adminUser: User = {
              id: 'u_admin_zh',
              name: 'Administrador ZH',
              email: 'zhseeger@gmail.com',
              role: 'Admin',
            }
            setUser(adminUser)
            localStorage.setItem('crm_auth_user', JSON.stringify(adminUser))
            resolve()
            return
          } else {
            reject(new Error('Credenciais inválidas'))
            return
          }
        }

        const users = getStoredUsers()
        const found = users.find(
          (u) => u.email.toLowerCase() === cleanEmail && u.passwordHash === pass,
        )

        if (!found) {
          reject(new Error('E-mail ou senha inválidos.'))
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
        if (users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
          reject(new Error('Email already registered.'))
          return
        }

        const newUser: RegisteredUser = {
          id: `u${Date.now()}`,
          name,
          email: email.trim(),
          role: 'SDR', // Default to restricted user to test RBAC
          passwordHash: pass,
        }

        users.push(newUser)
        saveStoredUsers(users)

        const loggedInUser: User = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }
        setUser(loggedInUser)
        localStorage.setItem('crm_auth_user', JSON.stringify(loggedInUser))

        resolve()
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
