import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export type WhatsAppStatus = 'checking' | 'connected' | 'disconnected' | 'error'

export function useWhatsAppStatus() {
  const { user } = useAuth()
  const [status, setStatus] = useState<WhatsAppStatus>('checking')

  useEffect(() => {
    if (!user) {
      setStatus('disconnected')
      return
    }

    const fetchStatus = async () => {
      const { data } = await supabase
        .from('whatsapp_configs')
        .select('status')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setStatus((data.status as WhatsAppStatus) || 'disconnected')
      } else {
        setStatus('disconnected')
      }
    }

    fetchStatus()

    const channel = supabase
      .channel('wa_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_configs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setStatus((payload.new as any).status || 'disconnected')
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return status
}
