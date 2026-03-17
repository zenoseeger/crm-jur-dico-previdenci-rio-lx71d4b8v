import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Client } from '@/types'

interface ClientStore {
  clients: Client[]
  addClient: (client: Client) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
}

const ClientContext = createContext<ClientStore | undefined>(undefined)

const INITIAL_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@email.com',
    phone: '(11) 98765-4321',
    status: 'Cliente Ativo',
    date: '14/03/2026',
    documents: [],
  },
  {
    id: '2',
    name: 'Maria Souza',
    cpf: '987.654.321-11',
    email: 'maria@email.com',
    phone: '(21) 99999-8888',
    status: 'Lead Quente',
    date: '12/03/2026',
    documents: [],
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    cpf: '456.123.789-22',
    email: 'carlos@email.com',
    phone: '(31) 97777-6666',
    status: 'Inativo',
    date: '01/03/2026',
    documents: [],
  },
]

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS)

  const addClient = (client: Client) => setClients((prev) => [client, ...prev])

  const updateClient = (id: string, data: Partial<Client>) =>
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))

  const deleteClient = (id: string) => setClients((prev) => prev.filter((c) => c.id !== id))

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
