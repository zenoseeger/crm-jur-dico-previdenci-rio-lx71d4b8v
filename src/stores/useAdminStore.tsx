import React, { createContext, useContext, useState, ReactNode } from 'react'
import { User, TagDef, AIConfig, WhatsAppConfig, PipelineStage, AIFlow } from '@/types'
import { toast } from 'sonner'

interface AdminStore {
  users: User[]
  tags: TagDef[]
  aiConfig: AIConfig
  whatsAppConfig: WhatsAppConfig
  pipelineStages: PipelineStage[]
  aiFlows: AIFlow[]
  addUser: (user: Omit<User, 'id'>) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  addTag: (tag: Omit<TagDef, 'id'>) => void
  updateTag: (id: string, tag: Partial<TagDef>) => void
  deleteTag: (id: string) => void
  updateAIConfig: (config: Partial<AIConfig>) => void
  updateWhatsAppConfig: (config: Partial<WhatsAppConfig>) => void
  addPipelineStage: (stage: Omit<PipelineStage, 'id' | 'order'>) => void
  updatePipelineStage: (id: string, stage: Partial<PipelineStage>) => void
  deletePipelineStage: (id: string) => void
  reorderPipelineStages: (newOrderIds: string[]) => void
  addAIFlow: (flow: Omit<AIFlow, 'id'>) => void
  updateAIFlow: (id: string, flow: Partial<AIFlow>) => void
  deleteAIFlow: (id: string) => void
}

const AdminContext = createContext<AdminStore | undefined>(undefined)

const initialTags: TagDef[] = [
  { id: 't1', name: 'Aposentadoria Rural', color: '#22c55e', category: 'Tipo de Benefício' },
  { id: 't2', name: 'Falta CNIS', color: '#ef4444', category: 'Status de Documentação' },
  { id: 't3', name: 'Segurado Qualificado', color: '#3b82f6', category: 'Qualificação' },
  { id: 't4', name: 'Urgente', color: '#f59e0b', category: 'Follow-up' },
]

const initialPipelineStages: PipelineStage[] = [
  { id: 's1', name: 'NOVO LEAD', order: 0, autoTags: [], autoTasks: [] },
  { id: 's2', name: 'EM QUALIFICAÇÃO', order: 1, autoTags: [], autoTasks: [] },
  { id: 's3', name: 'AGUARDANDO DOCUMENTOS', order: 2, autoTags: [], autoTasks: [] },
  { id: 's4', name: 'ANÁLISE JURÍDICA', order: 3, autoTags: [], autoTasks: [] },
  { id: 's5', name: 'CONTRATO ENVIADO', order: 4, autoTags: [], autoTasks: [] },
  { id: 's6', name: 'GANHO', order: 5, autoTags: [], autoTasks: [] },
]

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([])
  const [tags, setTags] = useState<TagDef[]>(initialTags)
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(initialPipelineStages)
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    prompt: '',
    model: 'gpt-4o',
    temperature: 0.7,
  })
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>({
    token: '',
    phoneId: '',
    accountId: '',
    connected: false,
    webhookUrl: '',
  })

  const [aiFlows, setAiFlows] = useState<AIFlow[]>([
    {
      id: 'f1',
      name: 'Contato Urgente',
      triggerTagName: 'Urgente',
      steps: [
        {
          id: 's1',
          order: 1,
          prompt: 'Crie uma mensagem urgente para agendar a reunião de fechamento hoje.',
          dueInDays: 0,
        },
        {
          id: 's2',
          order: 2,
          prompt: 'Gere um lembrete final caso o lead não tenha respondido à primeira mensagem.',
          dueInDays: 1,
        },
      ],
    },
  ])

  const value = {
    users,
    tags,
    aiConfig,
    whatsAppConfig,
    pipelineStages,
    aiFlows,
    addUser: (u: Omit<User, 'id'>) => setUsers((p) => [...p, { ...u, id: `u${Date.now()}` }]),
    updateUser: (id: string, u: Partial<User>) =>
      setUsers((p) => p.map((x) => (x.id === id ? { ...x, ...u } : x))),
    deleteUser: (id: string) => setUsers((p) => p.filter((x) => x.id !== id)),
    addTag: (t: Omit<TagDef, 'id'>) => setTags((p) => [...p, { ...t, id: `t${Date.now()}` }]),
    updateTag: (id: string, t: Partial<TagDef>) =>
      setTags((p) => p.map((x) => (x.id === id ? { ...x, ...t } : x))),
    deleteTag: (id: string) => setTags((p) => p.filter((x) => x.id !== id)),
    updateAIConfig: (c: Partial<AIConfig>) => setAiConfig((p) => ({ ...p, ...c })),
    updateWhatsAppConfig: (c: Partial<WhatsAppConfig>) =>
      setWhatsAppConfig((p) => ({ ...p, ...c })),
    addPipelineStage: (s: Omit<PipelineStage, 'id' | 'order'>) =>
      setPipelineStages((p) => [...p, { ...s, id: `s${Date.now()}`, order: p.length }]),
    updatePipelineStage: (id: string, s: Partial<PipelineStage>) =>
      setPipelineStages((p) => p.map((x) => (x.id === id ? { ...x, ...s } : x))),
    deletePipelineStage: (id: string) =>
      setPipelineStages((p) => p.filter((x) => x.id !== id).map((x, i) => ({ ...x, order: i }))),
    reorderPipelineStages: (ids: string[]) =>
      setPipelineStages((p) => {
        const m = new Map(p.map((s) => [s.id, s]))
        return ids.map((id, i) => ({ ...m.get(id)!, order: i }))
      }),
    addAIFlow: (f: Omit<AIFlow, 'id'>) => {
      setAiFlows((p) => [...p, { ...f, id: `f${Date.now()}` }])
      toast.success('Fluxo IA criado com sucesso!')
    },
    updateAIFlow: (id: string, f: Partial<AIFlow>) => {
      setAiFlows((p) => p.map((x) => (x.id === id ? { ...x, ...f } : x)))
      toast.success('Fluxo IA atualizado com sucesso!')
    },
    deleteAIFlow: (id: string) => {
      setAiFlows((p) => p.filter((x) => x.id !== id))
      toast.success('Fluxo IA removido.')
    },
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdminStore() {
  const context = useContext(AdminContext)
  if (!context) throw new Error('useAdminStore must be used within AdminProvider')
  return context
}
