import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus, Clock } from 'lucide-react'
import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'

type AutoInput = {
  title: string
  description: string
  daysOffset: string
}

export function TaskAutomationsManager() {
  const { pipelineStages } = useAdminStore()
  const { taskAutomations, addTaskAutomation, deleteTaskAutomation } = useLeadStore()
  const [inputs, setInputs] = useState<Record<string, AutoInput>>({})

  const uniqueStages = Array.from(new Set(pipelineStages.map((s) => s.name)))

  const getInputs = (stage: string) =>
    inputs[stage] || { title: '', description: '', daysOffset: '' }

  const handleAddAuto = (stage: string) => {
    const { title, description, daysOffset } = getInputs(stage)
    if (title.trim()) {
      const parsedOffset = daysOffset.trim() ? parseInt(daysOffset, 10) : undefined
      addTaskAutomation(
        stage,
        title.trim(),
        description.trim(),
        isNaN(parsedOffset!) ? undefined : parsedOffset,
      )
      setInputs((p) => ({ ...p, [stage]: { title: '', description: '', daysOffset: '' } }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automações por Etapa</CardTitle>
        <CardDescription>
          Defina tarefas que serão criadas automaticamente quando um lead entrar em uma etapa
          específica do pipeline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uniqueStages.map((stage) => {
          const automations = taskAutomations.filter((a) => a.stage === stage)
          return (
            <div key={stage} className="border rounded-lg p-4 space-y-4 bg-card shadow-sm">
              <h3 className="font-semibold text-base border-b pb-2">{stage}</h3>

              <div className="space-y-2">
                {automations.map((auto) => (
                  <div
                    key={auto.id}
                    className="flex flex-col gap-2 bg-muted/50 p-3 rounded-md animate-fade-in-up"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium">{auto.taskTitle}</span>
                        {auto.taskDescription && (
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {auto.taskDescription}
                          </p>
                        )}
                        {auto.dueDaysOffset !== undefined && auto.dueDaysOffset !== null && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              Prazo: {auto.dueDaysOffset}{' '}
                              {auto.dueDaysOffset === 1 ? 'dia' : 'dias'} após entrada
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTaskAutomation(auto.id)}
                        className="text-destructive h-8 w-8 hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {automations.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma automação configurada.
                  </p>
                )}
              </div>

              <div className="space-y-3 p-4 border rounded-lg bg-card/50 shadow-sm mt-4">
                <h4 className="text-sm font-medium">Nova Tarefa</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Título da tarefa (obrigatório)"
                    value={getInputs(stage).title}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        [stage]: { ...getInputs(stage), title: e.target.value },
                      }))
                    }
                    className="bg-background"
                  />
                  <Textarea
                    placeholder="Descrição ou notas adicionais..."
                    value={getInputs(stage).description}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        [stage]: { ...getInputs(stage), description: e.target.value },
                      }))
                    }
                    className="min-h-[80px] bg-background resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Definir prazo (dias após entrada na etapa)"
                        value={getInputs(stage).daysOffset}
                        onChange={(e) =>
                          setInputs((p) => ({
                            ...p,
                            [stage]: { ...getInputs(stage), daysOffset: e.target.value },
                          }))
                        }
                        className="pl-9 bg-background"
                        min="0"
                      />
                    </div>
                    <Button
                      onClick={() => handleAddAuto(stage)}
                      disabled={!getInputs(stage).title.trim()}
                      className="shrink-0 bg-muted-foreground text-background hover:bg-muted-foreground/90"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
