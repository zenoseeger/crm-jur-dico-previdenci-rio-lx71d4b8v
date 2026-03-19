import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User } from '@/types'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export interface RegisteredUser extends User {
  passwordHash?: string
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
      // Ignore JSON parse errors
    }
  }

  const defaultUsers: RegisteredUser[] = [
    {
      id: 'u_admin_zh',
      name: 'Administrador ZH',
      email: 'zhseeger@gmail.com',
      role: 'Admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u_admin',
      name: 'Administrador',
      email: 'admin@escritorio.com',
      role: 'Admin',
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

  users = users.map((u) => {
    if (!u.createdAt) {
      updated = true
      return { ...u, createdAt: new Date().toISOString() }
    }
    return u
  })

  if (updated) saveStoredUsers(users)
  return users
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUsers(getStoredUsers())

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error)
      }
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.email === 'zhseeger@gmail.com' ? 'Admin' : 'SDR',
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.email === 'zhseeger@gmail.com' ? 'Admin' : 'SDR',
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) throw new Error('Email ou senha inválidos.')

    if (data?.session?.user) {
      setUser({
        id: data.session.user.id,
        name:
          data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
        email: data.session.user.email || '',
        role: data.session.user.email === 'zhseeger@gmail.com' ? 'Admin' : 'SDR',
      })
    }
  }

  const register = async (name: string, email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { name } },
    })
    if (error) throw new Error(error.message)

    if (data?.session?.user) {
      setUser({
        id: data.session.user.id,
        name:
          data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
        email: data.session.user.email || '',
        role: data.session.user.email === 'zhseeger@gmail.com' ? 'Admin' : 'SDR',
      })
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
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
