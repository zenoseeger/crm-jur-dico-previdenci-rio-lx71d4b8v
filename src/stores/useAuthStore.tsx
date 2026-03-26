import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface RegisteredUser {
  id: string
  name: string
  email: string
  role: string
  companyId?: string
  companyName?: string
  createdAt?: string
}

export interface Profile {
  id: string
  email: string
  name: string
  company_id?: string
  role?: string
  is_admin?: boolean
  is_super_admin?: boolean
  [key: string]: any
}

export interface Company {
  id: string
  name: string
  status?: string
  createdAt?: string
  [key: string]: any
}

interface AuthState {
  user: User | null
  profile: Profile | null
  company: Company | null
  loading: boolean
  users: RegisteredUser[]
  companies: Company[]
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setCompany: (company: Company | null) => void
  fetchProfile: (userId: string) => Promise<void>
  signOut: () => Promise<void>
  fetchCompanies: () => Promise<void>
  createCompany: (name: string) => Promise<void>
  fetchUsers: () => Promise<void>
  adminCreateUser: (payload: any) => Promise<void>
  adminUpdateUser: (id: string, payload: any) => Promise<void>
  adminDeleteUser: (id: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  company: null,
  loading: true,
  users: [],
  companies: [],
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setCompany: (company) => set({ company }),
  fetchProfile: async (userId) => {
    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*, companies(*)')
        .eq('id', userId)
        .single()

      // Fallback to gracefully handle PGRST200 while schema cache reloads
      if (error && error.code === 'PGRST200') {
        console.warn(
          'Relationship profiles -> companies not found in schema cache. Using fallback.',
        )
        const fallback = await supabase.from('profiles').select('*').eq('id', userId).single()
        profile = fallback.data
        error = fallback.error
      }

      if (error) {
        console.error('Error fetching profile:', error)
        set({ profile: null, company: null, loading: false })
        return
      }

      let companyData = null
      if (profile?.companies) {
        companyData = Array.isArray(profile.companies) ? profile.companies[0] : profile.companies
      } else if (profile?.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single()
        if (company) companyData = company
      }

      set({ profile, company: companyData, loading: false })

      const isSuperAdmin = profile?.is_super_admin || profile?.email === 'zhseeger@gmail.com'
      if (isSuperAdmin) {
        get().fetchCompanies()
        get().fetchUsers()
      } else if (profile?.role === 'Admin') {
        get().fetchUsers()
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      set({ profile: null, company: null, loading: false })
    }
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, company: null, users: [], companies: [], loading: false })
  },
  fetchCompanies: async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      set({ companies: data.map((c) => ({ ...c, createdAt: c.created_at })) })
    }
  },
  createCompany: async (name: string) => {
    const { data, error } = await supabase.from('companies').insert({ name }).select().single()
    if (error) throw error
    if (data) {
      set((state) => ({ companies: [{ ...data, createdAt: data.created_at }, ...state.companies] }))
    }
  },
  fetchUsers: async () => {
    let { data, error } = await supabase
      .from('profiles')
      .select('*, companies(name)')
      .order('created_at', { ascending: false })

    // Fallback to gracefully handle PGRST200 while schema cache reloads
    if (error && error.code === 'PGRST200') {
      const fallbackData = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      data = fallbackData.data
      error = fallbackData.error
    }

    if (!error && data) {
      const users = data.map((p) => {
        const comp = p.companies
          ? Array.isArray(p.companies)
            ? p.companies[0]
            : p.companies
          : null
        return {
          id: p.id,
          name: p.name || '',
          email: p.email,
          role: p.role || 'SDR',
          companyId: p.company_id,
          companyName: comp?.name,
          createdAt: p.created_at,
        }
      })
      set({ users })
    }
  },
  adminCreateUser: async (payload: any) => {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: payload,
    })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    await get().fetchUsers()
  },
  adminUpdateUser: async (id: string, payload: any) => {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      method: 'PUT',
      body: { id, ...payload },
    })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    await get().fetchUsers()
  },
  adminDeleteUser: async (id: string) => {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      method: 'DELETE',
      body: { id },
    })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    await get().fetchUsers()
  },
}))
