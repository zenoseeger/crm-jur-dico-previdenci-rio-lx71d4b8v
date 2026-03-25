import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  TagDef,
  AIConfig as TypesAIConfig,
  WhatsAppConfig,
  PipelineStage,
  AIFlow,
  Pipeline,
  BenefitType,
  TagCategory,
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

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [tags, setTags] = useState<TagDef[]>([])
  const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>([])
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([])
  const [aiFlows, setAiFlows] = useState<AIFlow[]>([])

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
          if (!error && data) {
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
          if (!error && data) {
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

      supabase
        .from('tags')
        .select('*')
        .then(({ data, error }) => {
          if (!error && data) {
            setTags(
              data.map((d: any) => ({
                id: d.id,
                name: d.name,
                color: d.color,
                category: d.category as TagCategory,
              })),
            )
          }
        })

      supabase
        .from('benefit_types')
        .select('*')
        .then(({ data, error }) => {
          if (!error && data) {
            setBenefitTypes(
              data.map((d: any) => ({
                id: d.id,
                name: d.name,
                createdAt: d.created_at,
              })),
            )
          }
        })

      supabase
        .from('ai_flows')
        .select('*')
        .then(({ data, error }) => {
          if (!error && data) {
            setAiFlows(
              data.map((d: any) => ({
                id: d.id,
                name: d.name,
                triggerTagName: d.trigger_tag_name,
                steps: d.steps || [],
              })),
            )
          }
        })
    } else {
      setPipelines([])
      setPipelineStages([])
      setTags([])
      setBenefitTypes([])
      setAiFlows([])
    }
  }, [user])

  const value: AdminStore = {
    pipelines,
    tags,
    benefitTypes,
    aiConfig,
    whatsAppConfig,
    pipelineStages,
    aiFlows,
    addTag: (t: Omit<TagDef, 'id'>) => {
      const tempId = `t${Date.now()}`
      setTags((p) => [...p, { ...t, id: tempId }])
      if (user) {
        supabase
          .from('tags')
          .insert({
            id: tempId,
            name: t.name,
            color: t.color,
            category: t.category,
            user_id: user.id,
          })
          .then()
      }
      toast.success('Tag criada com sucesso!')
    },
    updateTag: (id: string, t: Partial<TagDef>) => {
      setTags((p) => p.map((x) => (x.id === id ? { ...x, ...t } : x)))
      const updateData: any = {}
      if (t.name !== undefined) updateData.name = t.name
      if (t.color !== undefined) updateData.color = t.color
      if (t.category !== undefined) updateData.category = t.category
      supabase.from('tags').update(updateData).eq('id', id).then()
      toast.success('Tag atualizada com sucesso!')
    },
    deleteTag: (id: string) => {
      setTags((p) => p.filter((x) => x.id !== id))
      supabase.from('tags').delete().eq('id', id).then()
      toast.success('Tag excluída com sucesso!')
    },
    addBenefitType: (name: string) => {
      const tempId = `b${Date.now()}`
      const createdAt = new Date().toISOString()
      setBenefitTypes((p) => [...p, { id: tempId, name, createdAt }])
      if (user) {
        supabase.from('benefit_types').insert({ id: tempId, name, user_id: user.id }).then()
      }
      toast.success('Produto criado com sucesso!')
    },
    updateBenefitType: (id: string, name: string) => {
      setBenefitTypes((p) => p.map((x) => (x.id === id ? { ...x, name } : x)))
      supabase.from('benefit_types').update({ name }).eq('id', id).then()
      toast.success('Produto atualizado com sucesso!')
    },
    deleteBenefitType: (id: string) => {
      setBenefitTypes((p) => p.filter((x) => x.id !== id))
      supabase.from('benefit_types').delete().eq('id', id).then()
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
      const tempId = `f${Date.now()}`
      setAiFlows((p) => [...p, { ...f, id: tempId }])
      if (user) {
        supabase
          .from('ai_flows')
          .insert({
            id: tempId,
            name: f.name,
            trigger_tag_name: f.triggerTagName,
            steps: f.steps as any,
            user_id: user.id,
          })
          .then()
      }
      toast.success('Fluxo IA criado com sucesso!')
    },
    updateAIFlow: (id: string, f: Partial<AIFlow>) => {
      setAiFlows((p) => p.map((x) => (x.id === id ? { ...x, ...f } : x)))
      const updateData: any = {}
      if (f.name !== undefined) updateData.name = f.name
      if (f.triggerTagName !== undefined) updateData.trigger_tag_name = f.triggerTagName
      if (f.steps !== undefined) updateData.steps = f.steps as any
      supabase.from('ai_flows').update(updateData).eq('id', id).then()
      toast.success('Fluxo IA atualizado com sucesso!')
    },
    deleteAIFlow: (id: string) => {
      setAiFlows((p) => p.filter((x) => x.id !== id))
      supabase.from('ai_flows').delete().eq('id', id).then()
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
