import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { Lead, Stage, Task, TaskTemplate, DocumentFile, TaskAutomation } from '@/types'
import { processTagsForFlows, processTaskCompletionForFlows } from '@/lib/flowLogic'
import { useAdminStore } from '@/stores/useAdminStore'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

interface LeadStore {
  leads: Lead[]
  selectedLead: Lead | null
  searchQuery: string
  currentPipelineId: string | null
  isLoading: boolean
  error: string | null
  taskAutomations: TaskAutomation[]
  setSearchQuery: (q: string) => void
  setSelectedLead: (lead: Lead | null) => void
  setCurrentPipelineId: (id: string | null) => void
  fetchLeads: (silent?: boolean) => Promise<void>
  fetchTaskAutomations: () => Promise<void>
  addTaskAutomation: (
    stage: string,
    taskTitle: string,
    taskDescription?: string,
    dueDaysOffset?: number,
  ) => Promise<void>
  deleteTaskAutomation: (id: string) => Promise<void>
  moveLead: (
    id: string,
    to: Stage,
    r?: string,
    tags?: string[],
    tasks?: TaskTemplate[],
  ) => Promise<void>
  addLead: (lead: Lead) => void
  editLead: (id: string, updates: Partial<Lead>) => Promise<void>
  deleteLead: (id: string) => Promise<void>
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
  updateLeadLocal: (id: string, updates: Partial<Lead>) => void
}

const LeadContext = createContext<LeadStore | undefined>(undefined)

export const LeadProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [taskAutomations, setTaskAutomations] = useState<TaskAutomation[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPipelineId, setCurrentPipelineId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { aiFlows } = useAdminStore()

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null

  const fetchLeads = useCallback(
    async (silent = false) => {
      if (!user) return

      if (!silent) setIsLoading(true)
      setError(null)
      try {
        const isAdmin = user.email === 'zhseeger@gmail.com'

        let leadsQuery = supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
        let docsQuery = supabase.from('documents').select('*')

        if (!isAdmin) {
          leadsQuery = leadsQuery.eq('user_id', user.id)
          docsQuery = docsQuery.eq('user_id', user.id)
        }

        const [leadsRes, docsRes] = await Promise.all([leadsQuery, docsQuery])

        if (leadsRes.error) throw leadsRes.error
        if (docsRes.error) throw docsRes.error

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
              unread: l.unread ?? false,
              benefitType: l.benefit_type || '',
              city: l.city || '',
              assignee: l.assignee || '',
              aiScore: l.ai_score || 0,
              aiSummary: l.ai_summary || '',
              aiEnabled: l.ai_enabled ?? false,
              aiTriggered: l.ai_triggered ?? false,
              tasks: (l.tasks as any) || [],
              activeFlows: (l.active_flows as any) || [],
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
        setError(err.message || 'Falha ao carregar leads da base de dados.')
      } finally {
        if (!silent) setIsLoading(false)
      }
    },
    [user],
  )

  const fetchTaskAutomations = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('task_automations')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      if (data) {
        setTaskAutomations(
          data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            stage: d.stage,
            taskTitle: d.task_title,
            taskDescription: d.task_description,
            dueDaysOffset: d.due_days_offset,
            createdAt: d.created_at,
          })),
        )
      }
    } catch (err) {
      console.error('Error fetching task automations:', err)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    if (user) {
      fetchLeads()
      fetchTaskAutomations()

      const channelOptions: any = { event: '*', schema: 'public', table: 'leads' }
      if (user.email !== 'zhseeger@gmail.com') {
        channelOptions.filter = `user_id=eq.${user.id}`
      }

      const channel = supabase
        .channel('leads_changes')
        .on('postgres_changes', channelOptions, () => {
          fetchLeads(true)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      setLeads([])
      setTaskAutomations([])
      setIsLoading(false)
    }
  }, [user, authLoading, fetchLeads, fetchTaskAutomations])

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

  const addTaskAutomation = async (
    stage: string,
    taskTitle: string,
    taskDescription?: string,
    dueDaysOffset?: number,
  ) => {
    if (!user) return
    const newAuto = {
      id: crypto.randomUUID(),
      user_id: user.id,
      stage,
      task_title: taskTitle,
      task_description: taskDescription || null,
      due_days_offset: dueDaysOffset ?? null,
      created_at: new Date().toISOString(),
    }
    const parsedNewAuto = {
      id: newAuto.id,
      userId: newAuto.user_id,
      stage: newAuto.stage,
      taskTitle: newAuto.task_title,
      taskDescription: newAuto.task_description || undefined,
      dueDaysOffset: newAuto.due_days_offset ?? undefined,
      createdAt: newAuto.created_at,
    }
    setTaskAutomations((p) => [...p, parsedNewAuto])
    const { error } = await supabase.from('task_automations').insert(newAuto as any)
    if (error) {
      setTaskAutomations((p) => p.filter((a) => a.id !== newAuto.id))
      toast.error('Erro ao salvar automação.')
    } else {
      toast.success('Automação salva com sucesso!')
    }
  }

  const deleteTaskAutomation = async (id: string) => {
    const prev = taskAutomations
    setTaskAutomations((p) => p.filter((a) => a.id !== id))
    const { error } = await supabase.from('task_automations').delete().eq('id', id)
    if (error) {
      setTaskAutomations(prev)
      toast.error('Erro ao remover automação.')
    } else {
      toast.success('Automação removida.')
    }
  }

  const editLead = async (id: string, updates: Partial<Lead>) => {
    const map: any = {}
    if (updates.name !== undefined) map.name = updates.name
    if (updates.email !== undefined) map.email = updates.email
    if (updates.phone !== undefined) map.phone = updates.phone
    if (updates.stage !== undefined) map.stage = updates.stage
    if (updates.benefitType !== undefined) map.benefit_type = updates.benefitType
    if (updates.city !== undefined) map.city = updates.city
    if (updates.assignee !== undefined) map.assignee = updates.assignee
    if (updates.heat !== undefined) map.heat = updates.heat

    if (Object.keys(map).length > 0) {
      const { error } = await supabase.from('leads').update(map).eq('id', id)
      if (error) throw error
    }

    setLeads((p) => p.map((l) => (l.id === id ? { ...l, ...updates } : l)))
  }

  const updateLeadLocal = (id: string, updates: Partial<Lead>) => {
    setLeads((p) => p.map((l) => (l.id === id ? { ...l, ...updates } : l)))
  }

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) throw error

    if (selectedLeadId === id) setSelectedLeadId(null)
    setLeads((p) => p.filter((l) => l.id !== id))
  }

  const moveLead = async (
    leadId: string,
    to: Stage,
    r?: string,
    autoTags: string[] = [],
    autoTasks: TaskTemplate[] = [],
  ) => {
    const l = leads.find((x) => x.id === leadId)
    if (!l) return

    let fetchedAutomations: any[] = []
    if (user) {
      const { data: dbAutomations } = await supabase
        .from('task_automations')
        .select('*')
        .eq('stage', to)
        .eq('user_id', user.id)

      if (dbAutomations) {
        fetchedAutomations = dbAutomations
      }
    } else {
      fetchedAutomations = taskAutomations
        .filter((a) => a.stage === to)
        .map((a) => ({
          task_title: a.taskTitle,
          task_description: a.taskDescription,
          due_days_offset: a.dueDaysOffset,
        }))
    }

    if (fetchedAutomations.length > 0) {
      toast.success(`${fetchedAutomations.length} tarefa(s) adicionada(s) automaticamente!`)
    }

    const tags = Array.from(new Set([...l.tags, ...autoTags]))
    const added = autoTasks.map((t) => ({
      id: crypto.randomUUID(),
      title: t.title,
      description: t.description,
      completed: false,
      createdAt: new Date().toISOString(),
    }))

    const addedFromAutomations = fetchedAutomations.map((a: any) => {
      let dueDate
      if (a.due_days_offset !== undefined && a.due_days_offset !== null) {
        const date = new Date()
        date.setDate(date.getDate() + a.due_days_offset)
        dueDate = date.toISOString()
      }
      return {
        id: crypto.randomUUID(),
        title: a.task_title,
        description: a.task_description || 'Criado via automação de etapa',
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate,
      }
    })

    const allNewTasks = [...added, ...addedFromAutomations]

    const { tasks, activeFlows } = processTagsForFlows(
      l,
      autoTags,
      [...(l.tasks || []), ...allNewTasks],
      l.activeFlows || [],
      aiFlows,
    )

    const nl = { ...l, stage: to, lostReason: r || l.lostReason, tags, tasks, activeFlows }

    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? nl : lead)))
    await updateDb(leadId, nl)
  }

  const toggleTask = (leadId: string, taskId: string) => {
    const l = leads.find((x) => x.id === leadId)
    if (!l) return
    const { tasks, activeFlows } = processTaskCompletionForFlows(
      taskId,
      l.tasks || [],
      l.activeFlows || [],
      aiFlows,
    )
    const nl = { ...l, tasks, activeFlows }
    setLeads((prev) => prev.map((x) => (x.id === leadId ? nl : x)))
    updateDb(leadId, nl)
  }

  const addTagToLead = (leadId: string, tag: string) => {
    const l = leads.find((x) => x.id === leadId)
    if (!l || l.tags.includes(tag)) return
    const { tasks, activeFlows } = processTagsForFlows(
      l,
      [tag],
      l.tasks || [],
      l.activeFlows || [],
      aiFlows,
    )
    const nl = { ...l, tags: [...l.tags, tag], tasks, activeFlows }
    setLeads((prev) => prev.map((x) => (x.id === leadId ? nl : x)))
    updateDb(leadId, nl)
  }

  const addTask = (leadId: string, task: Task) => {
    const l = leads.find((x) => x.id === leadId)
    if (!l) return
    const nl = { ...l, tasks: [task, ...(l.tasks || [])] }
    setLeads((p) => p.map((x) => (x.id === leadId ? nl : x)))
    updateDb(leadId, nl)
  }

  const addLead = async (lead: Lead) => {
    setLeads((p) => [lead, ...p])
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
        ai_summary: lead.aiSummary,
        ai_enabled: lead.aiEnabled,
        ai_triggered: lead.aiTriggered,
        tasks: lead.tasks,
        active_flows: lead.activeFlows,
        notes: lead.notes,
        user_id: user.id,
      })
    }
  }

  const markAsRead = (id: string) => {
    const l = leads.find((x) => x.id === id)
    if (!l) return
    const nl = { ...l, unread: false }
    setLeads((p) => p.map((x) => (x.id === id ? nl : x)))
    updateDb(id, nl)
  }

  const updateLeadStageNames = (pipelineId: string, o: string, n: string) => {
    const affected = leads.filter((l) => l.pipelineId === pipelineId && l.stage === o)
    if (affected.length === 0) return

    setLeads((p) =>
      p.map((l) => {
        if (l.pipelineId === pipelineId && l.stage === o) {
          return { ...l, stage: n }
        }
        return l
      }),
    )

    affected.forEach((l) => {
      updateDb(l.id, { stage: n })
    })
  }

  const toggleLeadAI = (leadId: string, enabled: boolean) => {
    const l = leads.find((x) => x.id === leadId)
    if (!l) return
    const nl = { ...l, aiEnabled: enabled }
    setLeads((p) => p.map((x) => (x.id === leadId ? nl : x)))
    updateDb(leadId, nl)
  }

  const markAITriggered = (leadId: string) => {
    const l = leads.find((x) => x.id === leadId)
    if (!l) return
    const nl = { ...l, aiTriggered: true }
    setLeads((p) => p.map((x) => (x.id === leadId ? nl : x)))
    updateDb(leadId, nl)
  }

  const addDocument = async (leadId: string, doc: DocumentFile) => {
    setLeads((p) =>
      p.map((l) => (l.id === leadId ? { ...l, documents: [doc, ...(l.documents || [])] } : l)),
    )
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
    taskAutomations,
    fetchLeads,
    fetchTaskAutomations,
    setSearchQuery,
    setCurrentPipelineId,
    addTaskAutomation,
    deleteTaskAutomation,
    moveLead,
    addLead,
    editLead,
    updateLeadLocal,
    deleteLead,
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
