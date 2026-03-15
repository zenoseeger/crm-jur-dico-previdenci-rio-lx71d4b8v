import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Lead, Stage, Task, TaskTemplate } from '@/types'
import { MOCK_LEADS } from '@/lib/mockData'
import { processTagsForFlows, processTaskCompletionForFlows } from '@/lib/flowLogic'
import { useAdminStore } from '@/stores/useAdminStore'

interface LeadStore {
  leads: Lead[]
  selectedLead: Lead | null
  searchQuery: string
  currentPipelineId: string | null
  setSearchQuery: (q: string) => void
  setSelectedLead: (lead: Lead | null) => void
  setCurrentPipelineId: (id: string | null) => void
  moveLead: (id: string, to: Stage, r?: string, tags?: string[], tasks?: TaskTemplate[]) => void
  addLead: (lead: Lead) => void
  markAsRead: (leadId: string) => void
  updateLeadStageNames: (pipelineId: string, oldName: string, newName: string) => void
  toggleTask: (leadId: string, taskId: string) => void
  addTask: (leadId: string, task: Task) => void
  addTagToLead: (leadId: string, tag: string) => void
  toggleLeadAI: (leadId: string, enabled: boolean) => void
}

const LeadContext = createContext<LeadStore | undefined>(undefined)

export const LeadProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPipelineId, setCurrentPipelineId] = useState<string | null>(null)
  const { aiFlows } = useAdminStore()

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null

  const moveLead = (
    leadId: string,
    to: Stage,
    r?: string,
    autoTags: string[] = [],
    autoTasks: TaskTemplate[] = [],
  ) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead
        const newTags = Array.from(new Set([...lead.tags, ...autoTags]))
        const addedTasks = autoTasks.map((t) => ({
          id: `task_${Date.now()}_${Math.random()}`,
          title: t.title,
          description: t.description,
          completed: false,
          createdAt: new Date().toISOString(),
          dueDate:
            t.dueInDays !== undefined
              ? new Date(Date.now() + t.dueInDays * 86400000).toISOString()
              : undefined,
        }))
        const { tasks, activeFlows } = processTagsForFlows(
          lead,
          autoTags,
          [...(lead.tasks || []), ...addedTasks],
          lead.activeFlows || [],
          aiFlows,
        )
        return {
          ...lead,
          stage: to,
          timeInStage: '0m',
          lostReason: r || lead.lostReason,
          tags: newTags,
          tasks,
          activeFlows,
        }
      }),
    )
  }

  const toggleTask = (leadId: string, taskId: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead
        const { tasks, activeFlows } = processTaskCompletionForFlows(
          taskId,
          lead.tasks || [],
          lead.activeFlows || [],
          aiFlows,
        )
        return { ...lead, tasks, activeFlows }
      }),
    )
  }

  const addTagToLead = (leadId: string, tag: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId || lead.tags.includes(tag)) return lead
        const { tasks, activeFlows } = processTagsForFlows(
          lead,
          [tag],
          lead.tasks || [],
          lead.activeFlows || [],
          aiFlows,
        )
        return { ...lead, tags: [...lead.tags, tag], tasks, activeFlows }
      }),
    )
  }

  const addTask = (leadId: string, task: Task) =>
    setLeads((p) =>
      p.map((l) => (l.id === leadId ? { ...l, tasks: [task, ...(l.tasks || [])] } : l)),
    )
  const addLead = (lead: Lead) => setLeads((p) => [lead, ...p])
  const markAsRead = (id: string) =>
    setLeads((p) => p.map((l) => (l.id === id ? { ...l, unread: false } : l)))
  const updateLeadStageNames = (pipelineId: string, o: string, n: string) =>
    setLeads((p) =>
      p.map((l) => (l.pipelineId === pipelineId && l.stage === o ? { ...l, stage: n } : l)),
    )
  const toggleLeadAI = (leadId: string, enabled: boolean) =>
    setLeads((p) => p.map((l) => (l.id === leadId ? { ...l, aiEnabled: enabled } : l)))

  const value = {
    leads: leads.filter(
      (l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.phone.includes(searchQuery),
    ),
    selectedLead,
    searchQuery,
    currentPipelineId,
    setSearchQuery,
    setCurrentPipelineId,
    moveLead,
    addLead,
    markAsRead,
    updateLeadStageNames,
    toggleTask,
    addTask,
    addTagToLead,
    toggleLeadAI,
    setSelectedLead: (l: Lead | null) => setSelectedLeadId(l ? l.id : null),
  }

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>
}

export default function useLeadStore() {
  const ctx = useContext(LeadContext)
  if (!ctx) throw new Error('useLeadStore must be used within LeadProvider')
  return ctx
}
