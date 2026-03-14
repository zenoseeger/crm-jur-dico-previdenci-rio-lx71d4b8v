import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Lead, Stage } from '@/types'
import { MOCK_LEADS } from '@/lib/mockData'
import { toast } from 'sonner'

interface LeadStore {
  leads: Lead[]
  selectedLead: Lead | null
  searchQuery: string
  setSearchQuery: (q: string) => void
  setSelectedLead: (lead: Lead | null) => void
  moveLead: (leadId: string, toStage: Stage, reason?: string) => void
  addLead: (lead: Lead) => void
  markAsRead: (leadId: string) => void
}

const LeadContext = createContext<LeadStore | undefined>(undefined)

export const LeadProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null

  const moveLead = (leadId: string, toStage: Stage, reason?: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead

        if (toStage === 'CLIENTE ATIVO' && lead.stage !== 'CLIENTE ATIVO') {
          toast.success(`🎉 Parabéns! Contrato de ${lead.name} assinado!`, {
            description: 'Mais um cliente ativo no escritório.',
          })
        }

        return {
          ...lead,
          stage: toStage,
          timeInStage: '0m',
          lostReason: reason ? reason : lead.lostReason,
        }
      }),
    )
  }

  const addLead = (lead: Lead) => {
    setLeads((prev) => [lead, ...prev])
  }

  const markAsRead = (leadId: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, unread: false } : l)))
  }

  const value = {
    leads: leads.filter(
      (l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.phone.includes(searchQuery),
    ),
    selectedLead,
    searchQuery,
    setSearchQuery,
    setSelectedLead: (lead: Lead | null) => setSelectedLeadId(lead ? lead.id : null),
    moveLead,
    addLead,
    markAsRead,
  }

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>
}

export default function useLeadStore() {
  const context = useContext(LeadContext)
  if (context === undefined) {
    throw new Error('useLeadStore must be used within a LeadProvider')
  }
  return context
}
