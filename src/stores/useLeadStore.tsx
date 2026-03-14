import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Lead, Stage, Task, TaskTemplate } from '@/types'
import { MOCK_LEADS } from '@/lib/mockData'
import { toast } from 'sonner'

interface LeadStore {
  leads: Lead[]
  selectedLead: Lead | null
  searchQuery: string
  setSearchQuery: (q: string) => void
  setSelectedLead: (lead: Lead | null) => void
  moveLead: (
    leadId: string,
    toStage: Stage,
    reason?: string,
    autoTags?: string[],
    autoTasks?: TaskTemplate[],
  ) => void
  addLead: (lead: Lead) => void
  markAsRead: (leadId: string) => void
  updateLeadStageNames: (oldName: string, newName: string) => void
  toggleTask: (leadId: string, taskId: string) => void
  addTask: (leadId: string, task: Task) => void
  addTagToLead: (leadId: string, tag: string) => void
}

const LeadContext = createContext<LeadStore | undefined>(undefined)

export const LeadProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null

  const moveLead = (
    leadId: string,
    toStage: Stage,
    reason?: string,
    autoTags: string[] = [],
    autoTasks: TaskTemplate[] = [],
  ) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead

        if (toStage === 'CLIENTE ATIVO' && lead.stage !== 'CLIENTE ATIVO') {
          toast.success(`🎉 Parabéns! Contrato de ${lead.name} assinado!`, {
            description: 'Mais um cliente ativo no escritório.',
          })
        }

        const newTags = Array.from(new Set([...lead.tags, ...autoTags]))
        const addedTasks = autoTasks.map((t) => {
          const dueDate = new Date()
          if (t.dueInDays !== undefined) {
            dueDate.setDate(dueDate.getDate() + t.dueInDays)
          }
          return {
            id: `task_${Date.now()}_${Math.random()}`,
            title: t.title,
            description: t.description,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: t.dueInDays !== undefined ? dueDate.toISOString() : undefined,
          }
        })

        const newTasks = [...(lead.tasks || []), ...addedTasks]

        return {
          ...lead,
          stage: toStage,
          timeInStage: '0m',
          lostReason: reason ? reason : lead.lostReason,
          tags: newTags,
          tasks: newTasks,
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

  const updateLeadStageNames = (oldName: string, newName: string) => {
    setLeads((prev) => prev.map((l) => (l.stage === oldName ? { ...l, stage: newName } : l)))
  }

  const toggleTask = (leadId: string, taskId: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead
        return {
          ...lead,
          tasks: (lead.tasks || []).map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t,
          ),
        }
      }),
    )
  }

  const addTask = (leadId: string, task: Task) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead
        return { ...lead, tasks: [task, ...(lead.tasks || [])] }
      }),
    )
  }

  const addTagToLead = (leadId: string, tag: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead
        if (lead.tags.includes(tag)) return lead
        return { ...lead, tags: [...lead.tags, tag] }
      }),
    )
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
    updateLeadStageNames,
    toggleTask,
    addTask,
    addTagToLead,
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
