import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/useAuthStore'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useAuthStore((state) => state.fetchProfile)
  const setStoreUser = useAuthStore((state) => state.setUser)
  const setStoreProfile = useAuthStore((state) => state.setProfile)
  const setStoreCompany = useAuthStore((state) => state.setCompany)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setStoreUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setStoreProfile(null)
        setStoreCompany(null)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setStoreUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile, setStoreUser, setStoreProfile, setStoreCompany])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    useAuthStore.getState().signOut()
    return { error }
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { user, session, loading, signIn, signOut } },
    children,
  )
}
