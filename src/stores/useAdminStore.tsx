import React, { createContext, useContext, useState, ReactNode } from 'react'
import {
  User,
  TagDef,
  AIConfig,
  WhatsAppConfig,
  UserRole,
  TagCategory,
  PipelineStage,
} from '@/types'
import { toast } from 'sonner'

interface AdminStore {
  users: User[]
  tags: TagDef[]
  aiConfig: AIConfig
  whatsAppConfig: WhatsAppConfig
  pipelineStages: PipelineStage[]
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
}

const AdminContext = createContext<AdminStore | undefined>(undefined)

const initialUsers: User[] = [
  { id: 'u1', name: 'Admin Principal', email: 'admin@escritorio.com', role: 'Admin' },
  { id: 'u2', name: 'João Silva', email: 'joao@escritorio.com', role: 'SDR' },
  { id: 'u3', name: 'Paula Souza', email: 'paula@escritorio.com', role: 'Closer' },
  { id: 'u4', name: 'Dr. Roberto', email: 'roberto@escritorio.com', role: 'Advogado' },
]

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
  { id: 's5', name: 'REUNIÃO DE FECHAMENTO', order: 4, autoTags: [], autoTasks: [] },
  { id: 's6', name: 'CONTRATO ENVIADO', order: 5, autoTags: [], autoTasks: [] },
  {
    id: 's7',
    name: 'CLIENTE ATIVO',
    order: 6,
    autoTags: ['Urgente'],
    autoTasks: [
      {
        id: 'tpl_1',
        title: 'Enviar mensagem de boas-vindas',
        description: 'Apresentar a equipe e os próximos passos.',
      },
    ],
  },
  { id: 's8', name: 'PERDIDO', order: 7, autoTags: [], autoTasks: [] },
]

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [tags, setTags] = useState<TagDef[]>(initialTags)
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(initialPipelineStages)
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    prompt:
      'Você é a assistente virtual do escritório de advocacia. Seja educada e foque em qualificar leads previdenciários.',
    model: 'gpt-4o',
    temperature: 0.7,
  })
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>({
    token: 'EAAGm0...',
    phoneId: '123456789',
    accountId: '987654321',
    connected: true,
    webhookUrl: 'https://api.crm-juridico.com/webhooks/whatsapp',
  })

  const value = {
    users,
    tags,
    aiConfig,
    whatsAppConfig,
    pipelineStages,
    addUser: (user: Omit<User, 'id'>) => {
      setUsers((prev) => [...prev, { ...user, id: `u${Date.now()}` }])
      toast.success('Usuário adicionado com sucesso!')
    },
    updateUser: (id: string, user: Partial<User>) => {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...user } : u)))
      toast.success('Usuário atualizado com sucesso!')
    },
    deleteUser: (id: string) => {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success('Usuário removido.')
    },
    addTag: (tag: Omit<TagDef, 'id'>) => {
      setTags((prev) => [...prev, { ...tag, id: `t${Date.now()}` }])
      toast.success('Tag criada com sucesso!')
    },
    updateTag: (id: string, tag: Partial<TagDef>) => {
      setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...tag } : t)))
      toast.success('Tag atualizada com sucesso!')
    },
    deleteTag: (id: string) => {
      setTags((prev) => prev.filter((t) => t.id !== id))
      toast.success('Tag removida.')
    },
    updateAIConfig: (config: Partial<AIConfig>) => {
      setAiConfig((prev) => ({ ...prev, ...config }))
      toast.success('Configurações de IA salvas!')
    },
    updateWhatsAppConfig: (config: Partial<WhatsAppConfig>) => {
      setWhatsAppConfig((prev) => ({ ...prev, ...config }))
      toast.success('Configurações do WhatsApp salvas!')
    },
    addPipelineStage: (stage: Omit<PipelineStage, 'id' | 'order'>) => {
      setPipelineStages((prev) => [...prev, { ...stage, id: `s${Date.now()}`, order: prev.length }])
      toast.success('Etapa criada com sucesso!')
    },
    updatePipelineStage: (id: string, stage: Partial<PipelineStage>) => {
      setPipelineStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...stage } : s)))
      toast.success('Etapa atualizada com sucesso!')
    },
    deletePipelineStage: (id: string) => {
      setPipelineStages((prev) =>
        prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })),
      )
      toast.success('Etapa removida.')
    },
    reorderPipelineStages: (newOrderIds: string[]) => {
      setPipelineStages((prev) => {
        const map = new Map(prev.map((s) => [s.id, s]))
        return newOrderIds.map((id, index) => ({ ...map.get(id)!, order: index }))
      })
    },
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdminStore() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdminStore must be used within an AdminProvider')
  }
  return context
}
