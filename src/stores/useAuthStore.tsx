import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { User as BaseUser } from '@/types'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export interface User extends BaseUser {}

export interface RegisteredUser extends User {
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
  fetchUsers: () => Promise<void>
  adminCreateUser: (data: any) => Promise<void>
  adminUpdateUser: (id: string, data: any) => Promise<void>
  adminDeleteUser: (id: string) => Promise<void>
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching profiles:', error)
        return
      }
      if (data) {
        setUsers(
          data.map((p: any) => ({
            id: p.id,
            name: p.name || '',
            email: p.email,
            role: p.role || 'SDR',
            createdAt: p.created_at,
          })),
        )
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const loadUserContext = async (sessionUser: any) => {
    try {
      const { data: profile } = (await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single()) as any

      setUser({
        id: sessionUser.id,
        name:
          profile?.name ||
          sessionUser.user_metadata?.name ||
          sessionUser.email?.split('@')[0] ||
          'User',
        email: sessionUser.email || '',
        role:
          profile?.role ||
          sessionUser.user_metadata?.role ||
          (sessionUser.email === 'zhseeger@gmail.com' ? 'Admin' : 'SDR'),
      })
      await fetchUsers()
    } catch (e) {
      console.error('Error loading user context', e)
    }
  }

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Auth store getSession error:', error)
          if (error.message.toLowerCase().includes('refresh token')) {
            supabase.auth.signOut().catch(() => {})
          }
          setUser(null)
          setIsLoading(false)
        } else if (session?.user) {
          loadUserContext(session.user).then(() => setIsLoading(false))
        } else {
          setUser(null)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Auth store getSession catch:', err)
        setUser(null)
        setIsLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setUsers([])
        setIsLoading(false)
      } else if (session?.user) {
        loadUserContext(session.user).then(() => setIsLoading(false))
      } else {
        setUser(null)
        setUsers([])
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUsers])

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) {
      if (error.message.includes('Invalid login') || error.status === 400) {
        throw new Error('Email ou senha inválidos.')
      }
      throw new Error(error.message)
    }
  }

  const register = async (name: string, email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { name, role: 'Admin' } },
    })
    if (error) {
      if ((error as any).code === 'over_email_send_rate_limit' || error.status === 429) {
        throw new Error(
          'Limite de envio de e-mails atingido. Por favor, tente novamente em alguns minutos.',
        )
      }
      throw new Error(error.message)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const adminCreateUser = async (data: any) => {
    const { data: resData, error } = await supabase.functions.invoke('admin-users', {
      method: 'POST',
      body: data,
    })
    if (error || resData?.error)
      throw new Error(resData?.error || error?.message || 'Erro ao criar usuário')
    await fetchUsers()
    toast.success('Usuário criado com sucesso!')
  }

  const adminUpdateUser = async (id: string, data: any) => {
    const { data: resData, error } = await supabase.functions.invoke('admin-users', {
      method: 'PUT',
      body: { id, ...data },
    })
    if (error || resData?.error)
      throw new Error(resData?.error || error?.message || 'Erro ao atualizar usuário')
    await fetchUsers()
    toast.success('Usuário atualizado com sucesso!')
  }

  const adminDeleteUser = async (id: string) => {
    const { data: resData, error } = await supabase.functions.invoke('admin-users', {
      method: 'DELETE',
      body: { id },
    })
    if (error || resData?.error) {
      toast.error('Erro ao remover usuário')
      return
    }
    await fetchUsers()
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
        fetchUsers,
        adminCreateUser,
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
