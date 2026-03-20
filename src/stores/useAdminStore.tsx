import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  TagDef,
  AIConfig as TypesAIConfig,
  WhatsAppConfig,
  PipelineStage,
  AIFlow,
  Pipeline,
  BenefitType,
} from '@/types'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export interface AIConfig extends TypesAIConfig {
  responseDelay: number
  fragmentMessages: boolean
}

interface AdminStore {
  tags: TagDef[]
  benefitTypes: BenefitType[]
  aiConfig: AIConfig
  whatsAppConfig: WhatsAppConfig
  pipelines: Pipeline[]
  pipelineStages: PipelineStage[]
  aiFlows: AIFlow[]
  addTag: (tag: Omit<TagDef, 'id'>) => void
  updateTag: (id: string, tag: Partial<TagDef>) => void
  deleteTag: (id: string) => void
  addBenefitType: (name: string) => void
  updateBenefitType: (id: string, name: string) => void
  deleteBenefitType: (id: string) => void
  updateAIConfig: (config: Partial<AIConfig>) => void
  updateWhatsAppConfig: (config: Partial<WhatsAppConfig>) => void
  addPipeline: (p: Omit<Pipeline, 'id'>, steps: string[]) => string
  updatePipeline: (id: string, p: Partial<Pipeline>) => void
  deletePipeline: (id: string) => void
  addPipelineStage: (stage: Omit<PipelineStage, 'id' | 'order'>) => void
  updatePipelineStage: (id: string, stage: Partial<PipelineStage>) => void
  deletePipelineStage: (id: string) => void
  reorderPipelineStages: (newOrderIds: string[]) => void
  addAIFlow: (flow: Omit<AIFlow, 'id'>) => void
  updateAIFlow: (id: string, flow: Partial<AIFlow>) => void
  deleteAIFlow: (id: string) => void
}

const AdminContext = createContext<AdminStore | undefined>(undefined)

const initialPipelines: Pipeline[] = [{ id: 'p1', name: 'Aposentadoria (Padrão)', userIds: [] }]

const initialTags: TagDef[] = [
  { id: 't1', name: 'Aposentadoria Rural', color: '#22c55e', category: 'Tipo de Benefício' },
  { id: 't2', name: 'Falta CNIS', color: '#ef4444', category: 'Status de Documentação' },
  { id: 't3', name: 'Segurado Qualificado', color: '#3b82f6', category: 'Qualificação' },
  { id: 't4', name: 'Urgente', color: '#f59e0b', category: 'Follow-up' },
]

const initialBenefitTypes: BenefitType[] = [
  { id: 'b1', name: 'Aposentadoria por Idade', createdAt: new Date().toISOString() },
  { id: 'b2', name: 'Aposentadoria Rural', createdAt: new Date().toISOString() },
  { id: 'b3', name: 'BPC/LOAS', createdAt: new Date().toISOString() },
  { id: 'b4', name: 'Pensão por Morte', createdAt: new Date().toISOString() },
  { id: 'b5', name: 'Auxílio Doença', createdAt: new Date().toISOString() },
  { id: 'b6', name: 'Outros', createdAt: new Date().toISOString() },
]

const initialPipelineStages: PipelineStage[] = [
  { id: 's1', pipelineId: 'p1', name: 'NOVO LEAD', order: 0, autoTags: [], autoTasks: [] },
  { id: 's2', pipelineId: 'p1', name: 'EM QUALIFICAÇÃO', order: 1, autoTags: [], autoTasks: [] },
  {
    id: 's3',
    pipelineId: 'p1',
    name: 'AGUARDANDO DOCUMENTOS',
    order: 2,
    autoTags: [],
    autoTasks: [],
  },
  { id: 's4', pipelineId: 'p1', name: 'ANÁLISE JURÍDICA', order: 3, autoTags: [], autoTasks: [] },
  { id: 's5', pipelineId: 'p1', name: 'CONTRATO ENVIADO', order: 4, autoTags: [], autoTasks: [] },
  { id: 's6', pipelineId: 'p1', name: 'GANHO', order: 5, autoTags: [], autoTasks: [] },
]

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [pipelines, setPipelines] = useState<Pipeline[]>(initialPipelines)
  const [tags, setTags] = useState<TagDef[]>(initialTags)
  const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>(initialBenefitTypes)
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(initialPipelineStages)

  const [aiConfig, setAiConfig] = useState<AIConfig>({
    apiKey: '',
    prompt:
      'Você é um assistente virtual focado em atendimento direto. Respond as the assistant directly to the user. Do not include analysis, summaries of previous messages, or descriptions of your strategy in the final output.',
    model: 'gpt-5.4-mini',
    temperature: 0.7,
    enabled: true,
    knowledgeBase: '',
    triggerMode: 'always',
    triggerCondition: 'contains',
    triggerKeyword: '',
    qualificationPrompt:
      'Analise a conversa e dê uma nota de 0 a 100 indicando a probabilidade de fechamento.',
    responseDelay: 0,
    fragmentMessages: false,
  })

  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>({
    token: '',
    phoneId: '',
    accountId: '',
    connected: false,
    webhookUrl: '',
    connectionType: 'official',
    webSessionStatus: 'disconnected',
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
          media: [
            {
              id: 'm1',
              type: 'image',
              url: 'https://img.usecurling.com/p/200/200?q=document',
              name: 'documento_exemplo.jpg',
            },
          ],
        },
      ],
    },
  ])

  useEffect(() => {
    if (user) {
      supabase
        .from('ai_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching AI Config:', error)
            return
          }
          if (data) {
            setAiConfig((p) => ({
              ...p,
              apiKey: data.api_key || '',
              model: data.model || 'gpt-5.4-mini',
              prompt: data.prompt || p.prompt,
              qualificationPrompt: data.qualification_prompt || p.qualificationPrompt,
              enabled: data.enabled ?? true,
              knowledgeBase: data.knowledge_base || '',
              triggerMode: data.trigger_mode || 'always',
              triggerCondition: data.trigger_condition || 'contains',
              triggerKeyword: data.trigger_keyword || '',
              responseDelay: (data as any).response_delay || 0,
              fragmentMessages: (data as any).fragment_messages || false,
            }))
          }
        })

      supabase
        .from('pipelines')
        .select('*')
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setPipelines(
              data.map((d: any) => ({
                id: d.id,
                name: d.name,
                userIds: d.user_ids || [],
              })),
            )
          }
        })

      supabase
        .from('pipeline_stages')
        .select('*')
        .order('order', { ascending: true })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setPipelineStages(
              data.map((d: any) => ({
                id: d.id,
                pipelineId: d.pipeline_id,
                name: d.name,
                order: d.order,
                autoTags: d.auto_tags || [],
                autoTasks: d.auto_tasks || [],
              })),
            )
          }
        })
    }
  }, [user])

  const value = {
    pipelines,
    tags,
    benefitTypes,
    aiConfig,
    whatsAppConfig,
    pipelineStages,
    aiFlows,
    addTag: (t: Omit<TagDef, 'id'>) => setTags((p) => [...p, { ...t, id: `t${Date.now()}` }]),
    updateTag: (id: string, t: Partial<TagDef>) =>
      setTags((p) => p.map((x) => (x.id === id ? { ...x, ...t } : x))),
    deleteTag: (id: string) => setTags((p) => p.filter((x) => x.id !== id)),
    addBenefitType: (name: string) => {
      setBenefitTypes((p) => [
        ...p,
        { id: `b${Date.now()}`, name, createdAt: new Date().toISOString() },
      ])
      toast.success('Produto criado com sucesso!')
    },
    updateBenefitType: (id: string, name: string) => {
      setBenefitTypes((p) => p.map((x) => (x.id === id ? { ...x, name } : x)))
      toast.success('Produto atualizado com sucesso!')
    },
    deleteBenefitType: (id: string) => {
      setBenefitTypes((p) => p.filter((x) => x.id !== id))
      toast.success('Produto excluído com sucesso!')
    },
    updateAIConfig: (c: Partial<AIConfig>) => {
      setAiConfig((p) => {
        const updated = { ...p, ...c }
        if (user) {
          supabase
            .from('ai_configs')
            .upsert(
              {
                user_id: user.id,
                api_key: updated.apiKey,
                model: updated.model,
                prompt: updated.prompt,
                qualification_prompt: updated.qualificationPrompt,
                enabled: updated.enabled,
                knowledge_base: updated.knowledgeBase,
                trigger_mode: updated.triggerMode,
                trigger_condition: updated.triggerCondition,
                trigger_keyword: updated.triggerKeyword,
                response_delay: updated.responseDelay,
                fragment_messages: updated.fragmentMessages,
              } as any,
              { onConflict: 'user_id' },
            )
            .then()
        }
        return updated
      })
    },
    updateWhatsAppConfig: (c: Partial<WhatsAppConfig>) =>
      setWhatsAppConfig((p) => ({ ...p, ...c })),
    addPipeline: (p: Omit<Pipeline, 'id'>, steps: string[]) => {
      const newId = crypto.randomUUID()
      const newPipeline = { ...p, id: newId }
      setPipelines((prev) => [...prev, newPipeline])

      const newStages = steps.map((name, i) => ({
        id: crypto.randomUUID(),
        pipelineId: newId,
        name,
        order: i,
        autoTags: [],
        autoTasks: [],
      }))

      setPipelineStages((sPrev) => [...sPrev, ...newStages])

      if (user) {
        supabase
          .from('pipelines')
          .insert({
            id: newId,
            name: p.name,
            user_ids: p.userIds,
            user_id: user.id,
          })
          .then(() => {
            if (newStages.length > 0) {
              supabase
                .from('pipeline_stages')
                .insert(
                  newStages.map((s) => ({
                    id: s.id,
                    pipeline_id: s.pipelineId,
                    name: s.name,
                    order: s.order,
                    auto_tags: s.autoTags,
                    auto_tasks: s.autoTasks,
                  })),
                )
                .then()
            }
          })
      }

      toast.success('Pipeline criado com sucesso!')
      return newId
    },
    updatePipeline: (id: string, p: Partial<Pipeline>) => {
      setPipelines((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)))
      const updateData: any = {}
      if (p.name !== undefined) updateData.name = p.name
      if (p.userIds !== undefined) updateData.user_ids = p.userIds
      supabase.from('pipelines').update(updateData).eq('id', id).then()
      toast.success('Pipeline atualizado!')
    },
    deletePipeline: (id: string) => {
      setPipelines((prev) => prev.filter((x) => x.id !== id))
      setPipelineStages((prev) => prev.filter((x) => x.pipelineId !== id))
      supabase.from('pipelines').delete().eq('id', id).then()
      toast.success('Pipeline removido com sucesso!')
    },
    addPipelineStage: (s: Omit<PipelineStage, 'id' | 'order'>) => {
      setPipelineStages((p) => {
        const order = p.filter((x) => x.pipelineId === s.pipelineId).length
        const newId = crypto.randomUUID()
        const newStage = { ...s, id: newId, order }

        supabase
          .from('pipeline_stages')
          .insert({
            id: newId,
            pipeline_id: s.pipelineId,
            name: s.name,
            order,
            auto_tags: s.autoTags,
            auto_tasks: s.autoTasks,
          })
          .then()

        return [...p, newStage]
      })
    },
    updatePipelineStage: (id: string, s: Partial<PipelineStage>) => {
      setPipelineStages((p) => p.map((x) => (x.id === id ? { ...x, ...s } : x)))
      const updateData: any = {}
      if (s.name !== undefined) updateData.name = s.name
      if (s.autoTags !== undefined) updateData.auto_tags = s.autoTags
      if (s.autoTasks !== undefined) updateData.auto_tasks = s.autoTasks
      supabase.from('pipeline_stages').update(updateData).eq('id', id).then()
    },
    deletePipelineStage: (id: string) => {
      setPipelineStages((p) => {
        const remaining = p.filter((x) => x.id !== id)
        const deleted = p.find((x) => x.id === id)
        if (!deleted) return remaining

        const sibs = remaining
          .filter((x) => x.pipelineId === deleted.pipelineId)
          .sort((a, b) => a.order - b.order)

        const sibsUpdated = sibs.map((x, i) => ({ ...x, order: i }))

        supabase
          .from('pipeline_stages')
          .delete()
          .eq('id', id)
          .then(() => {
            sibsUpdated.forEach((stage) => {
              supabase
                .from('pipeline_stages')
                .update({ order: stage.order })
                .eq('id', stage.id)
                .then()
            })
          })

        return remaining.map((r) => sibsUpdated.find((su) => su.id === r.id) || r)
      })
    },
    reorderPipelineStages: (ids: string[]) => {
      setPipelineStages((p) => {
        const m = new Map(p.map((s) => [s.id, s]))
        const updatedStages = ids.map((id, i) => ({ ...m.get(id)!, order: i }))
        const updatedIds = new Set(ids)

        updatedStages.forEach((stage) => {
          supabase.from('pipeline_stages').update({ order: stage.order }).eq('id', stage.id).then()
        })

        return p.map((s) => (updatedIds.has(s.id) ? updatedStages.find((x) => x.id === s.id)! : s))
      })
    },
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
