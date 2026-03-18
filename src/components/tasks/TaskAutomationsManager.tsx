import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus } from 'lucide-react'
import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'

export function TaskAutomationsManager() {
  const { pipelineStages } = useAdminStore()
  const { taskAutomations, addTaskAutomation, deleteTaskAutomation } = useLeadStore()
  const [inputs, setInputs] = useState<Record<string, string>>({})

  const uniqueStages = Array.from(new Set(pipelineStages.map((s) => s.name)))

  const handleAddAuto = (stage: string) => {
    const title = inputs[stage]
    if (title?.trim()) {
      addTaskAutomation(stage, title.trim())
      setInputs((p) => ({ ...p, [stage]: '' }))
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
                    className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-md"
                  >
                    <span className="text-sm font-medium">{auto.taskTitle}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTaskAutomation(auto.id)}
                      className="text-destructive h-8 w-8 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {automations.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma automação configurada.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Input
                  placeholder="Título da nova tarefa..."
                  value={inputs[stage] || ''}
                  onChange={(e) => setInputs((p) => ({ ...p, [stage]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddAuto(stage)
                  }}
                  className="max-w-sm h-9"
                />
                <Button onClick={() => handleAddAuto(stage)} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
