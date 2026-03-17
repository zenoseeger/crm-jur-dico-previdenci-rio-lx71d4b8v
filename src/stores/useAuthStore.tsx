import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User } from '@/types'
import { toast } from 'sonner'

export interface RegisteredUser extends User {
  passwordHash: string
  createdAt?: string
}

interface AuthStore {
  user: User | null
  users: RegisteredUser[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (name: string, email: string, pass: string) => Promise<void>
  logout: () => void
  adminUpdateUser: (id: string, data: Partial<RegisteredUser>) => void
  adminDeleteUser: (id: string) => void
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

  const defaultUsers: RegisteredUser[] = [
    {
      id: 'u_admin_zh',
      name: 'Administrador ZH',
      email: 'zhseeger@gmail.com',
      role: 'Admin',
      passwordHash: 'trip7*2017',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u_admin',
      name: 'Administrador',
      email: 'admin@escritorio.com',
      role: 'Admin',
      passwordHash: 'Admin123',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u2',
      name: 'SDR João',
      email: 'joao@exemplo.com',
      role: 'SDR',
      passwordHash: 'senha123',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u3',
      name: 'Closer Paula',
      email: 'paula@exemplo.com',
      role: 'Closer',
      passwordHash: 'senha123',
      createdAt: new Date().toISOString(),
    },
  ]

  let updated = false
  defaultUsers.forEach((defUser) => {
    if (!users.some((u) => u.email.toLowerCase() === defUser.email.toLowerCase())) {
      users.push(defUser)
      updated = true
    }
  })

  // Ensure all users have a createdAt timestamp
  users = users.map((u) => {
    if (!u.createdAt) {
      updated = true
      return { ...u, createdAt: new Date().toISOString() }
    }
    return u
  })

  if (updated) {
    saveStoredUsers(users)
  }

  return users
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<RegisteredUser[]>([])
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
    const loadedUsers = getStoredUsers()
    setUsers(loadedUsers)
    setIsLoading(false)
  }, [])

  const login = async (email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const cleanEmail = email.trim().toLowerCase()

        // Administrative Login Override
        if (cleanEmail === 'zhseeger@gmail.com' && pass === 'trip7*2017') {
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
        }

        const allUsers = getStoredUsers()
        const found = allUsers.find(
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
        const allUsers = getStoredUsers()
        if (allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
          reject(new Error('Email already registered.'))
          return
        }

        const newUser: RegisteredUser = {
          id: `u${Date.now()}`,
          name,
          email: email.trim(),
          role: 'Usuário',
          passwordHash: pass,
          createdAt: new Date().toISOString(),
        }

        allUsers.push(newUser)
        saveStoredUsers(allUsers)
        setUsers(allUsers)

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

  const adminUpdateUser = (id: string, data: Partial<RegisteredUser>) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...data } : u))
      saveStoredUsers(next)
      return next
    })
    toast.success('Usuário atualizado com sucesso!')
  }

  const adminDeleteUser = (id: string) => {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id)
      saveStoredUsers(next)
      return next
    })
    toast.success('Usuário removido.')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        adminUpdateUser,
        adminDeleteUser,
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
