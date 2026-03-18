import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Lead, Stage, Task, TaskTemplate, DocumentFile } from '@/types'
import { processTagsForFlows, processTaskCompletionForFlows } from '@/lib/flowLogic'
import { useAdminStore } from '@/stores/useAdminStore'
import { supabase } from '@/lib/supabase/client'

interface LeadStore {
  leads: Lead[]
  selectedLead: Lead | null
  searchQuery: string
  currentPipelineId: string | null
  isLoading: boolean
  error: string | null
  setSearchQuery: (q: string) => void
  setSelectedLead: (lead: Lead | null) => void
  setCurrentPipelineId: (id: string | null) => void
  fetchLeads: () => Promise<void>
  moveLead: (id: string, to: Stage, r?: string, tags?: string[], tasks?: TaskTemplate[]) => void
  addLead: (lead: Lead) => void
  markAsRead: (leadId: string) => void
  updateLeadStageNames: (pipelineId: string, oldName: string, newName: string) => void
  toggleTask: (leadId: string, taskId: string) => void
  addTask: (leadId: string, task: Task) => void
  addTagToLead: (leadId: string, tag: string) => void
  toggleLeadAI: (leadId: string, enabled: boolean) => void
  markAITriggered: (leadId: string) => void
  addDocument: (leadId: string, doc: DocumentFile) => void
  removeDocument: (leadId: string, docId: string) => void
  updateLeadNotes: (leadId: string, notes: string) => Promise<void>
}

const LeadContext = createContext<LeadStore | undefined>(undefined)

export const LeadProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPipelineId, setCurrentPipelineId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { aiFlows } = useAdminStore()

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null

  const fetchLeads = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setIsLoading(false)
        return
      }

      const isAdmin = user.email === 'zhseeger@gmail.com'

      let leadsQuery = supabase.from('leads').select('*').order('created_at', { ascending: false })
      let docsQuery = supabase.from('documents').select('*')

      if (!isAdmin) {
        leadsQuery = leadsQuery.eq('user_id', user.id)
        docsQuery = docsQuery.eq('user_id', user.id)
      }

      const [leadsRes, docsRes] = await Promise.all([leadsQuery, docsQuery])

      if (leadsRes.error) throw new Error(leadsRes.error.message)
      if (docsRes.error) throw new Error(docsRes.error.message)

      if (leadsRes.data) {
        setLeads(
          leadsRes.data.map((l) => ({
            id: l.id,
            name: l.name,
            phone: l.phone,
            email: l.email || '',
            pipelineId: l.pipeline_id || 'p1',
            stage: l.stage,
            heat: (l.heat as any) || 'Morno',
            tags: l.tags || [],
            timeInStage: l.time_in_stage || '0m',
            unread: l.unread,
            benefitType: l.benefit_type || '',
            city: l.city || '',
            assignee: l.assignee || '',
            aiScore: l.ai_score || 0,
            aiEnabled: l.ai_enabled,
            aiTriggered: l.ai_triggered,
            tasks: l.tasks || [],
            activeFlows: l.active_flows || [],
            lostReason: l.notes || '',
            notes: l.notes || '',
            createdAt: l.created_at,
            documents:
              docsRes.data
                ?.filter((d) => d.lead_id === l.id)
                .map((d) => ({
                  id: d.id,
                  name: d.name,
                  url: d.file_url,
                  size: d.size || 0,
                  type: d.type || '',
                  uploadDate: d.created_at,
                  leadId: d.lead_id,
                })) || [],
          })),
        )
      }
    } catch (err: any) {
      console.error('Error fetching leads:', err)
      setError(err.message || 'Falha ao carregar leads.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((e, s) => {
      if (s?.user) {
        fetchLeads()
      } else {
        setLeads([])
        setIsLoading(false)
      }
    })

    fetchLeads()

    return () => sub.data.subscription.unsubscribe()
  }, [])

  const updateDb = async (id: string, updates: Partial<Lead>) => {
    const map: any = {}
    if (updates.stage !== undefined) map.stage = updates.stage
    if (updates.tags !== undefined) map.tags = updates.tags
    if (updates.tasks !== undefined) map.tasks = updates.tasks
    if (updates.activeFlows !== undefined) map.active_flows = updates.activeFlows
    if (updates.lostReason !== undefined) map.notes = updates.lostReason
    if (updates.notes !== undefined) map.notes = updates.notes
    if (updates.aiEnabled !== undefined) map.ai_enabled = updates.aiEnabled
    if (updates.aiTriggered !== undefined) map.ai_triggered = updates.aiTriggered
    if (updates.unread !== undefined) map.unread = updates.unread
    if (Object.keys(map).length > 0) await supabase.from('leads').update(map).eq('id', id)
  }

  const moveLead = (
    leadId: string,
    to: Stage,
    r?: string,
    autoTags: string[] = [],
    autoTasks: TaskTemplate[] = [],
  ) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l
        const tags = Array.from(new Set([...l.tags, ...autoTags]))
        const added = autoTasks.map((t) => ({
          id: crypto.randomUUID(),
          title: t.title,
          description: t.description,
          completed: false,
          createdAt: new Date().toISOString(),
        }))
        const { tasks, activeFlows } = processTagsForFlows(
          l,
          autoTags,
          [...(l.tasks || []), ...added],
          l.activeFlows || [],
          aiFlows,
        )
        const nl = { ...l, stage: to, lostReason: r || l.lostReason, tags, tasks, activeFlows }
        updateDb(leadId, nl)
        return nl
      }),
    )
  }

  const toggleTask = (leadId: string, taskId: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l
        const { tasks, activeFlows } = processTaskCompletionForFlows(
          taskId,
          l.tasks || [],
          l.activeFlows || [],
          aiFlows,
        )
        const nl = { ...l, tasks, activeFlows }
        updateDb(leadId, nl)
        return nl
      }),
    )
  }

  const addTagToLead = (leadId: string, tag: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId || l.tags.includes(tag)) return l
        const { tasks, activeFlows } = processTagsForFlows(
          l,
          [tag],
          l.tasks || [],
          l.activeFlows || [],
          aiFlows,
        )
        const nl = { ...l, tags: [...l.tags, tag], tasks, activeFlows }
        updateDb(leadId, nl)
        return nl
      }),
    )
  }

  const addTask = (leadId: string, task: Task) =>
    setLeads((p) =>
      p.map((l) => {
        if (l.id !== leadId) return l
        const nl = { ...l, tasks: [task, ...(l.tasks || [])] }
        updateDb(leadId, nl)
        return nl
      }),
    )

  const addLead = async (lead: Lead) => {
    setLeads((p) => [lead, ...p])
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('leads').insert({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        pipeline_id: lead.pipelineId,
        stage: lead.stage,
        heat: lead.heat,
        tags: lead.tags,
        time_in_stage: lead.timeInStage,
        unread: lead.unread,
        benefit_type: lead.benefitType,
        city: lead.city,
        assignee: lead.assignee,
        ai_score: lead.aiScore,
        ai_enabled: lead.aiEnabled,
        ai_triggered: lead.aiTriggered,
        tasks: lead.tasks,
        active_flows: lead.activeFlows,
        notes: lead.notes,
        user_id: user.id,
      })
    }
  }

  const markAsRead = (id: string) =>
    setLeads((p) =>
      p.map((l) => {
        if (l.id !== id) return l
        const nl = { ...l, unread: false }
        updateDb(id, nl)
        return nl
      }),
    )

  const updateLeadStageNames = (pipelineId: string, o: string, n: string) => {
    setLeads((p) =>
      p.map((l) => {
        if (l.pipelineId === pipelineId && l.stage === o) {
          const nl = { ...l, stage: n }
          updateDb(l.id, nl)
          return nl
        }
        return l
      }),
    )
  }

  const toggleLeadAI = (leadId: string, enabled: boolean) =>
    setLeads((p) =>
      p.map((l) => {
        if (l.id !== leadId) return l
        const nl = { ...l, aiEnabled: enabled }
        updateDb(leadId, nl)
        return nl
      }),
    )

  const markAITriggered = (leadId: string) =>
    setLeads((p) =>
      p.map((l) => {
        if (l.id !== leadId) return l
        const nl = { ...l, aiTriggered: true }
        updateDb(leadId, nl)
        return nl
      }),
    )

  const addDocument = async (leadId: string, doc: DocumentFile) => {
    setLeads((p) =>
      p.map((l) => (l.id === leadId ? { ...l, documents: [doc, ...(l.documents || [])] } : l)),
    )
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('documents').insert({
        id: doc.id,
        name: doc.name,
        file_url: doc.url,
        size: doc.size,
        type: doc.type,
        lead_id: leadId,
        user_id: user.id,
      })
    }
  }

  const removeDocument = async (leadId: string, docId: string) => {
    setLeads((p) =>
      p.map((l) =>
        l.id === leadId
          ? { ...l, documents: (l.documents || []).filter((d) => d.id !== docId) }
          : l,
      ),
    )
    await supabase.from('documents').delete().eq('id', docId)
  }

  const updateLeadNotes = async (leadId: string, notes: string) => {
    setLeads((p) => p.map((l) => (l.id === leadId ? { ...l, notes } : l)))
    const { error } = await supabase.from('leads').update({ notes }).eq('id', leadId)
    if (error) throw error
  }

  const value = {
    leads: leads.filter(
      (l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.phone.includes(searchQuery),
    ),
    selectedLead,
    searchQuery,
    currentPipelineId,
    isLoading,
    error,
    fetchLeads,
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
    markAITriggered,
    addDocument,
    removeDocument,
    updateLeadNotes,
    setSelectedLead: (l: Lead | null) => setSelectedLeadId(l ? l.id : null),
  }

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>
}

export default function useLeadStore() {
  const ctx = useContext(LeadContext)
  if (!ctx) throw new Error('useLeadStore must be used within LeadProvider')
  return ctx
}
