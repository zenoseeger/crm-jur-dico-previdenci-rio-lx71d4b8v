import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Client } from '@/types'
import { supabase } from '@/lib/supabase/client'

interface ClientStore {
  clients: Client[]
  addClient: (client: Client) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
}

const ClientContext = createContext<ClientStore | undefined>(undefined)

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([])

  const fetchClients = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const isAdmin = user.email === 'zhseeger@gmail.com'

    let clientsQuery = supabase.from('clients').select('*')
    let docsQuery = supabase.from('documents').select('*')

    if (!isAdmin) {
      clientsQuery = clientsQuery.eq('user_id', user.id)
      docsQuery = docsQuery.eq('user_id', user.id)
    }

    const [{ data: dbClients }, { data: dbDocs }] = await Promise.all([clientsQuery, docsQuery])

    if (dbClients) {
      setClients(
        dbClients.map((c) => ({
          id: c.id,
          name: c.name,
          cpf: c.cpf || '',
          email: c.email || '',
          phone: c.phone || '',
          status: c.status || 'Cliente Ativo',
          date: new Date(c.created_at).toLocaleDateString('pt-BR'),
          city: c.city || '',
          benefitType: c.benefit_type || '',
          documents:
            dbDocs
              ?.filter((d) => d.client_id === c.id)
              .map((d) => ({
                id: d.id,
                name: d.name,
                url: d.file_url,
                size: d.size || 0,
                type: d.type || '',
                uploadDate: d.created_at,
                clientId: d.client_id,
              })) || [],
        })),
      )
    }
  }

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((e, s) =>
      s?.user ? fetchClients() : setClients([]),
    )
    fetchClients()
    return () => sub.data.subscription.unsubscribe()
  }, [])

  const addClient = async (client: Client) => {
    setClients((p) => [client, ...p])
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('clients').insert({
        id: client.id,
        name: client.name,
        cpf: client.cpf,
        email: client.email,
        phone: client.phone,
        status: client.status,
        city: client.city,
        benefit_type: client.benefitType,
        user_id: user.id,
      })
    }
  }

  const updateClient = async (id: string, data: Partial<Client>) => {
    setClients((p) => p.map((c) => (c.id === id ? { ...c, ...data } : c)))
    const map: any = {}
    if (data.name) map.name = data.name
    if (data.cpf) map.cpf = data.cpf
    if (data.phone) map.phone = data.phone
    if (data.email) map.email = data.email
    if (data.status) map.status = data.status
    if (data.city) map.city = data.city
    if (data.benefitType) map.benefit_type = data.benefitType
    if (Object.keys(map).length > 0) await supabase.from('clients').update(map).eq('id', id)
  }

  const deleteClient = async (id: string) => {
    setClients((p) => p.filter((c) => c.id !== id))
    await supabase.from('clients').delete().eq('id', id)
  }

  return (
    <ClientContext.Provider value={{ clients, addClient, updateClient, deleteClient }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClientStore() {
  const context = useContext(ClientContext)
  if (!context) throw new Error('useClientStore must be used within ClientProvider')
  return context
}
