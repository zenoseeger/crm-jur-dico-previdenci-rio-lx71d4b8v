import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string
  name: string
  company_id?: string
  is_admin?: boolean
  is_super_admin?: boolean
  [key: string]: any
}

interface Company {
  id: string
  name: string
  [key: string]: any
}

interface AuthState {
  user: User | null
  profile: Profile | null
  company: Company | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setCompany: (company: Company | null) => void
  fetchProfile: (userId: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  company: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setCompany: (company) => set({ company }),
  fetchProfile: async (userId) => {
    try {
      // Fetch profile without joining companies to avoid PGRST200 when FK is missing
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        set({ profile: null, company: null, loading: false })
        return
      }

      let companyData = null
      // Manually fetch company if company_id is present to avoid relation issues
      if (profile?.company_id) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single()

        if (!companyError) {
          companyData = company
        } else {
          console.error('Error fetching company:', companyError)
        }
      }

      set({ profile, company: companyData, loading: false })
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      set({ profile: null, company: null, loading: false })
    }
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, company: null, loading: false })
  },
}))
