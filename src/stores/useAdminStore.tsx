import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
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
  addTag: (tag: Omit<TagDef, 'id'>) => Promise<void>
  updateTag: (id: string, tag: Partial<TagDef>) => Promise<void>
  deleteTag: (id: string) => Promise<void>
  addBenefitType: (name: string) => Promise<void>
  updateBenefitType: (id: string, name: string) => Promise<void>
  deleteBenefitType: (id: string) => Promise<void>
  updateAIConfig: (config: Partial<AIConfig>) => Promise<void>
  updateWhatsAppConfig: (config: Partial<WhatsAppConfig>) => void
  addPipeline: (p: Omit<Pipeline, 'id'>, steps: string[]) => Promise<string | undefined>
  updatePipeline: (id: string, p: Partial<Pipeline>) => Promise<void>
  deletePipeline: (id: string) => Promise<void>
  addPipelineStage: (stage: Omit<PipelineStage, 'id' | 'order'>) => Promise<void>
  updatePipelineStage: (id: string, stage: Partial<PipelineStage>) => Promise<void>
  deletePipelineStage: (id: string) => Promise<void>
  reorderPipelineStages: (newOrderIds: string[]) => void
  addAIFlow: (flow: Omit<AIFlow, 'id'>) => Promise<void>
  updateAIFlow: (id: string, flow: Partial<AIFlow>) => Promise<void>
  deleteAIFlow: (id: string) => Promise<void>
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
    if (!user) {
      setPipelines([])
      setPipelineStages([])
      setTags([])
      setBenefitTypes([])
      setAiFlows([])
      return
    }

    const fetchData = async () => {
      // AI Config
      const { data: aiData } = await supabase
        .from('ai_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (aiData) {
        setAiConfig((p) => ({
          ...p,
          apiKey: aiData.api_key || '',
          model: aiData.model || 'gpt-5.4-mini',
          prompt: aiData.prompt || p.prompt,
          qualificationPrompt: aiData.qualification_prompt || p.qualificationPrompt,
          enabled: aiData.enabled ?? true,
          knowledgeBase: aiData.knowledge_base || '',
          triggerMode: (aiData.trigger_mode as any) || 'always',
          triggerCondition: (aiData.trigger_condition as any) || 'contains',
          triggerKeyword: aiData.trigger_keyword || '',
          responseDelay: (aiData as any).response_delay || 0,
          fragmentMessages: (aiData as any).fragment_messages || false,
        }))
      }

      // Tags
      const { data: tagsData } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .limit(10000)
      if (tagsData) {
        setTags(
          tagsData.map((d: any) => ({
            id: d.id,
            name: d.name,
            color: d.color,
            category: d.category as TagCategory,
          })),
        )
      }

      // Benefit Types
      const { data: benData } = await supabase
        .from('benefit_types')
        .select('*')
        .eq('user_id', user.id)
        .limit(10000)
      if (benData) {
        setBenefitTypes(
          benData.map((d: any) => ({
            id: d.id,
            name: d.name,
            createdAt: d.created_at,
          })),
        )
      }

      // AI Flows
      const { data: flowsData } = await supabase
        .from('ai_flows')
        .select('*')
        .eq('user_id', user.id)
        .limit(10000)
      if (flowsData) {
        setAiFlows(
          flowsData.map((d: any) => ({
            id: d.id,
            name: d.name,
            triggerTagName: d.trigger_tag_name,
            steps: d.steps || [],
          })),
        )
      }

      // Pipelines
      const { data: pipesData } = await supabase.from('pipelines').select('*').limit(10000)
      if (pipesData) {
        const userPipelines = pipesData.filter(
          (d: any) => d.user_id === user.id || (d.user_ids && d.user_ids.includes(user.id)),
        )
        setPipelines(
          userPipelines.map((d: any) => ({
            id: d.id,
            name: d.name,
            userIds: d.user_ids || [],
          })),
        )

        if (userPipelines.length > 0) {
          const pIds = userPipelines.map((p) => p.id)
          const { data: stagesData } = await supabase
            .from('pipeline_stages')
            .select('*')
            .in('pipeline_id', pIds)
            .order('order', { ascending: true })
            .limit(10000)
          if (stagesData) {
            setPipelineStages(
              stagesData.map((d: any) => ({
                id: d.id,
                pipelineId: d.pipeline_id,
                name: d.name,
                order: d.order,
                autoTags: d.auto_tags || [],
                autoTasks: d.auto_tasks || [],
              })),
            )
          }
        }
      }
    }

    fetchData()
  }, [user])

  const value = useMemo<AdminStore>(
    () => ({
      pipelines,
      tags,
      benefitTypes,
      aiConfig,
      whatsAppConfig,
      pipelineStages,
      aiFlows,

      addTag: async (t: Omit<TagDef, 'id'>) => {
        if (!user) return
        const tempId = `t${Date.now()}`
        const newTag = { ...t, id: tempId }
        setTags((p) => [...p, newTag])

        const { error } = await supabase.from('tags').insert({
          id: tempId,
          name: t.name,
          color: t.color,
          category: t.category,
          user_id: user.id,
        })
        if (error) {
          console.error('Erro ao adicionar tag:', error)
          toast.error('Erro ao salvar a tag. Tente novamente.')
          setTags((p) => p.filter((x) => x.id !== tempId))
        } else {
          toast.success('Tag criada com sucesso!')
        }
      },

      updateTag: async (id: string, t: Partial<TagDef>) => {
        const prev = tags.find((x) => x.id === id)
        setTags((p) => p.map((x) => (x.id === id ? { ...x, ...t } : x)))

        const updateData: any = {}
        if (t.name !== undefined) updateData.name = t.name
        if (t.color !== undefined) updateData.color = t.color
        if (t.category !== undefined) updateData.category = t.category

        const { error } = await supabase.from('tags').update(updateData).eq('id', id)
        if (error) {
          console.error('Erro ao atualizar tag:', error)
          toast.error('Erro ao atualizar a tag.')
          if (prev) setTags((p) => p.map((x) => (x.id === id ? prev : x)))
        } else {
          toast.success('Tag atualizada com sucesso!')
        }
      },

      deleteTag: async (id: string) => {
        const prev = tags.find((x) => x.id === id)
        setTags((p) => p.filter((x) => x.id !== id))

        const { error } = await supabase.from('tags').delete().eq('id', id)
        if (error) {
          console.error('Erro ao remover tag:', error)
          toast.error('Erro ao excluir a tag.')
          if (prev) setTags((p) => [...p, prev])
        } else {
          toast.success('Tag excluída com sucesso!')
        }
      },

      addBenefitType: async (name: string) => {
        if (!user) return
        const tempId = `b${Date.now()}`
        const createdAt = new Date().toISOString()
        const newBenefit = { id: tempId, name, createdAt }
        setBenefitTypes((p) => [...p, newBenefit])

        const { error } = await supabase
          .from('benefit_types')
          .insert({ id: tempId, name, user_id: user.id })
        if (error) {
          toast.error('Erro ao criar produto.')
          setBenefitTypes((p) => p.filter((x) => x.id !== tempId))
        } else {
          toast.success('Produto criado com sucesso!')
        }
      },

      updateBenefitType: async (id: string, name: string) => {
        const prev = benefitTypes.find((x) => x.id === id)
        setBenefitTypes((p) => p.map((x) => (x.id === id ? { ...x, name } : x)))

        const { error } = await supabase.from('benefit_types').update({ name }).eq('id', id)
        if (error) {
          toast.error('Erro ao atualizar produto.')
          if (prev) setBenefitTypes((p) => p.map((x) => (x.id === id ? prev : x)))
        } else {
          toast.success('Produto atualizado com sucesso!')
        }
      },

      deleteBenefitType: async (id: string) => {
        const prev = benefitTypes.find((x) => x.id === id)
        setBenefitTypes((p) => p.filter((x) => x.id !== id))

        const { error } = await supabase.from('benefit_types').delete().eq('id', id)
        if (error) {
          toast.error('Erro ao excluir produto.')
          if (prev) setBenefitTypes((p) => [...p, prev])
        } else {
          toast.success('Produto excluído com sucesso!')
        }
      },

      updateAIConfig: async (c: Partial<AIConfig>) => {
        if (!user) return
        setAiConfig((p) => {
          const updated = { ...p, ...c }
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
          return updated
        })
      },

      updateWhatsAppConfig: (c: Partial<WhatsAppConfig>) =>
        setWhatsAppConfig((p) => ({ ...p, ...c })),

      addPipeline: async (p: Omit<Pipeline, 'id'>, steps: string[]) => {
        if (!user) return undefined
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

        const { error: pError } = await supabase.from('pipelines').insert({
          id: newId,
          name: p.name,
          user_ids: p.userIds,
          user_id: user.id,
        })

        if (pError) {
          toast.error('Erro ao criar pipeline.')
          setPipelines((prev) => prev.filter((x) => x.id !== newId))
          setPipelineStages((prev) => prev.filter((x) => x.pipelineId !== newId))
          return undefined
        }

        if (newStages.length > 0) {
          await supabase.from('pipeline_stages').insert(
            newStages.map((s) => ({
              id: s.id,
              pipeline_id: s.pipelineId,
              name: s.name,
              order: s.order,
              auto_tags: s.autoTags,
              auto_tasks: s.autoTasks,
            })),
          )
        }

        toast.success('Pipeline criado com sucesso!')
        return newId
      },

      updatePipeline: async (id: string, p: Partial<Pipeline>) => {
        setPipelines((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)))
        const updateData: any = {}
        if (p.name !== undefined) updateData.name = p.name
        if (p.userIds !== undefined) updateData.user_ids = p.userIds
        await supabase.from('pipelines').update(updateData).eq('id', id)
        toast.success('Pipeline atualizado!')
      },

      deletePipeline: async (id: string) => {
        setPipelines((prev) => prev.filter((x) => x.id !== id))
        setPipelineStages((prev) => prev.filter((x) => x.pipelineId !== id))
        await supabase.from('pipelines').delete().eq('id', id)
        toast.success('Pipeline removido com sucesso!')
      },

      addPipelineStage: async (s: Omit<PipelineStage, 'id' | 'order'>) => {
        const order = pipelineStages.filter((x) => x.pipelineId === s.pipelineId).length
        const newId = crypto.randomUUID()
        const newStage = { ...s, id: newId, order }

        setPipelineStages((p) => [...p, newStage])
        await supabase.from('pipeline_stages').insert({
          id: newId,
          pipeline_id: s.pipelineId,
          name: s.name,
          order,
          auto_tags: s.autoTags,
          auto_tasks: s.autoTasks,
        })
      },

      updatePipelineStage: async (id: string, s: Partial<PipelineStage>) => {
        setPipelineStages((p) => p.map((x) => (x.id === id ? { ...x, ...s } : x)))
        const updateData: any = {}
        if (s.name !== undefined) updateData.name = s.name
        if (s.autoTags !== undefined) updateData.auto_tags = s.autoTags
        if (s.autoTasks !== undefined) updateData.auto_tasks = s.autoTasks
        await supabase.from('pipeline_stages').update(updateData).eq('id', id)
      },

      deletePipelineStage: async (id: string) => {
        const deleted = pipelineStages.find((x) => x.id === id)
        setPipelineStages((p) => {
          const remaining = p.filter((x) => x.id !== id)
          if (!deleted) return remaining

          const sibs = remaining
            .filter((x) => x.pipelineId === deleted.pipelineId)
            .sort((a, b) => a.order - b.order)
          const sibsUpdated = sibs.map((x, i) => ({ ...x, order: i }))
          return remaining.map((r) => sibsUpdated.find((su) => su.id === r.id) || r)
        })

        if (deleted) {
          await supabase.from('pipeline_stages').delete().eq('id', id)
          const remaining = pipelineStages.filter((x) => x.id !== id)
          const sibs = remaining
            .filter((x) => x.pipelineId === deleted.pipelineId)
            .sort((a, b) => a.order - b.order)
          sibs.forEach((stage, i) => {
            supabase.from('pipeline_stages').update({ order: i }).eq('id', stage.id).then()
          })
        }
      },

      reorderPipelineStages: (ids: string[]) => {
        setPipelineStages((p) => {
          const m = new Map(p.map((s) => [s.id, s]))
          const updatedStages = ids.map((id, i) => ({ ...m.get(id)!, order: i }))
          const updatedIds = new Set(ids)

          updatedStages.forEach((stage) => {
            supabase
              .from('pipeline_stages')
              .update({ order: stage.order })
              .eq('id', stage.id)
              .then()
          })

          return p.map((s) =>
            updatedIds.has(s.id) ? updatedStages.find((x) => x.id === s.id)! : s,
          )
        })
      },

      addAIFlow: async (f: Omit<AIFlow, 'id'>) => {
        if (!user) return
        const tempId = `f${Date.now()}`
        const newFlow = { ...f, id: tempId }
        setAiFlows((p) => [...p, newFlow])

        const { error } = await supabase.from('ai_flows').insert({
          id: tempId,
          name: f.name,
          trigger_tag_name: f.triggerTagName,
          steps: f.steps as any,
          user_id: user.id,
        })
        if (error) {
          toast.error('Erro ao criar fluxo.')
          setAiFlows((p) => p.filter((x) => x.id !== tempId))
        } else {
          toast.success('Fluxo IA criado com sucesso!')
        }
      },

      updateAIFlow: async (id: string, f: Partial<AIFlow>) => {
        const prev = aiFlows.find((x) => x.id === id)
        setAiFlows((p) => p.map((x) => (x.id === id ? { ...x, ...f } : x)))

        const updateData: any = {}
        if (f.name !== undefined) updateData.name = f.name
        if (f.triggerTagName !== undefined) updateData.trigger_tag_name = f.triggerTagName
        if (f.steps !== undefined) updateData.steps = f.steps as any

        const { error } = await supabase.from('ai_flows').update(updateData).eq('id', id)
        if (error) {
          toast.error('Erro ao atualizar fluxo.')
          if (prev) setAiFlows((p) => p.map((x) => (x.id === id ? prev : x)))
        } else {
          toast.success('Fluxo IA atualizado com sucesso!')
        }
      },

      deleteAIFlow: async (id: string) => {
        const prev = aiFlows.find((x) => x.id === id)
        setAiFlows((p) => p.filter((x) => x.id !== id))

        const { error } = await supabase.from('ai_flows').delete().eq('id', id)
        if (error) {
          toast.error('Erro ao remover fluxo.')
          if (prev) setAiFlows((p) => [...p, prev])
        } else {
          toast.success('Fluxo IA removido.')
        }
      },
    }),
    [pipelines, tags, benefitTypes, aiConfig, whatsAppConfig, pipelineStages, aiFlows, user],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdminStore() {
  const context = useContext(AdminContext)
  if (!context) throw new Error('useAdminStore must be used within AdminProvider')
  return context
}
