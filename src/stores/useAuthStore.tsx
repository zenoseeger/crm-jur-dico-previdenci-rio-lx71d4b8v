import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { User, Company } from '@/types'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export interface RegisteredUser extends User {
  createdAt?: string
  companyName?: string
}

interface AuthStore {
  user: User | null
  company: Company | null
  users: RegisteredUser[]
  companies: Company[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (name: string, email: string, pass: string) => Promise<void>
  logout: () => void
  fetchUsers: () => Promise<void>
  fetchCompanies: () => Promise<void>
  createCompany: (name: string) => Promise<void>
  adminCreateUser: (data: any) => Promise<void>
  adminUpdateUser: (id: string, data: any) => Promise<void>
  adminDeleteUser: (id: string) => Promise<void>
}

const AuthContext = createContext<AuthStore | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, companies(name)')
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
            companyId: p.company_id,
            companyName: p.companies?.name,
            createdAt: p.created_at,
          })),
        )
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const fetchCompanies = useCallback(async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setCompanies(data as any[])
  }, [])

  const createCompany = async (name: string) => {
    const { data, error } = await supabase
      .from('companies')
      .insert({ name } as any)
      .select()
      .single()
    if (error) throw new Error(error.message)
    setCompanies((p) => [data as any, ...p])
    toast.success('Empresa criada com sucesso!')
  }

  const loadUserContext = async (sessionUser: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single()

      const isSuper = profile?.is_super_admin || sessionUser.email === 'zhseeger@gmail.com'

      setUser({
        id: sessionUser.id,
        name:
          profile?.name ||
          sessionUser.user_metadata?.name ||
          sessionUser.email?.split('@')[0] ||
          'User',
        email: sessionUser.email || '',
        role: profile?.role || sessionUser.user_metadata?.role || (isSuper ? 'Admin' : 'SDR'),
        companyId: profile?.company_id,
        isSuperAdmin: isSuper,
      })

      if (profile?.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single()
        if (companyData) setCompany(companyData as any)
      }

      if (isSuper) {
        await fetchCompanies()
      }

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
          setCompany(null)
          setIsLoading(false)
        } else if (session?.user) {
          loadUserContext(session.user).then(() => setIsLoading(false))
        } else {
          setUser(null)
          setCompany(null)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Auth store getSession catch:', err)
        setUser(null)
        setCompany(null)
        setIsLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setCompany(null)
        setUsers([])
        setCompanies([])
        setIsLoading(false)
      } else if (session?.user) {
        loadUserContext(session.user).then(() => setIsLoading(false))
      } else {
        setUser(null)
        setCompany(null)
        setUsers([])
        setCompanies([])
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUsers, fetchCompanies])

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
    setCompany(null)
    setCompanies([])
    setUsers([])
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
        company,
        users,
        companies,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        fetchUsers,
        fetchCompanies,
        createCompany,
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
