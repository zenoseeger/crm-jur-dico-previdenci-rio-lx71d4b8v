import React, { useState } from 'react'
import { useAdminStore } from '@/stores/useAdminStore'
import useLeadStore from '@/stores/useLeadStore'
import { PipelineStage } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Edit2, Trash2, Plus, ArrowUp, ArrowDown, Settings, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function PipelineManagement() {
  const {
    pipelineStages,
    addPipelineStage,
    updatePipelineStage,
    deletePipelineStage,
    reorderPipelineStages,
    tags,
  } = useAdminStore()
  const { updateLeadStageNames, leads } = useLeadStore()

  const [isOpen, setIsOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null)

  const [formData, setFormData] = useState<Omit<PipelineStage, 'id' | 'order'>>({
    name: '',
    autoTags: [],
    autoTasks: [],
  })

  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')

  const handleOpenDialog = (stage?: PipelineStage) => {
    if (stage) {
      setEditingStage(stage)
      setFormData({
        name: stage.name,
        autoTags: [...stage.autoTags],
        autoTasks: [...stage.autoTasks],
      })
    } else {
      setEditingStage(null)
      setFormData({ name: '', autoTags: [], autoTasks: [] })
    }
    setTaskTitle('')
    setTaskDesc('')
    setIsOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) return

    if (editingStage) {
      if (editingStage.name !== formData.name) {
        updateLeadStageNames(editingStage.name, formData.name)
      }
      updatePipelineStage(editingStage.id, formData)
    } else {
      addPipelineStage(formData)
    }
    setIsOpen(false)
  }

  const handleDelete = (stage: PipelineStage) => {
    const leadsInStage = leads.filter((l) => l.stage === stage.name).length
    if (leadsInStage > 0) {
      if (
        !window.confirm(
          `Existem ${leadsInStage} leads nesta etapa. Se você excluir, eles podem ficar sem etapa definida. Tem certeza?`,
        )
      ) {
        return
      }
    }
    deletePipelineStage(stage.id)
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...pipelineStages].sort((a, b) => a.order - b.order)
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    reorderPipelineStages(newOrder.map((s) => s.id))
  }

  const moveDown = (index: number) => {
    if (index === pipelineStages.length - 1) return
    const newOrder = [...pipelineStages].sort((a, b) => a.order - b.order)
    ;[newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]]
    reorderPipelineStages(newOrder.map((s) => s.id))
  }

  const toggleTag = (tagName: string) => {
    setFormData((prev) => {
      if (prev.autoTags.includes(tagName)) {
        return { ...prev, autoTags: prev.autoTags.filter((t) => t !== tagName) }
      }
      return { ...prev, autoTags: [...prev.autoTags, tagName] }
    })
  }

  const addTask = () => {
    if (!taskTitle.trim()) return
    setFormData((prev) => ({
      ...prev,
      autoTasks: [
        ...prev.autoTasks,
        { id: `tpl_${Date.now()}`, title: taskTitle, description: taskDesc },
      ],
    }))
    setTaskTitle('')
    setTaskDesc('')
  }

  const removeTask = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      autoTasks: prev.autoTasks.filter((t) => t.id !== id),
    }))
  }

  const sortedStages = [...pipelineStages].sort((a, b) => a.order - b.order)

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestão do Pipeline</CardTitle>
          <CardDescription>
            Configure as etapas do Kanban e as automações de entrada.
          </CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Etapa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingStage ? 'Editar Etapa' : 'Criar Nova Etapa'}</DialogTitle>
              <DialogDescription>
                Defina o nome da etapa e as ações que ocorrerão automaticamente quando um lead for
                movido para cá.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Nome da Etapa</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Negociação"
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-primary" /> Automações de Entrada
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Essas ações ocorrerão automaticamente quando o lead entrar na etapa.
                  </p>
                </div>

                <div className="space-y-2 bg-muted/30 p-4 rounded-lg border">
                  <Label>Adicionar Tags Automaticamente</Label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((tag) => {
                      const isSelected = formData.autoTags.includes(tag.name)
                      return (
                        <Badge
                          key={tag.id}
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer transition-colors"
                          onClick={() => toggleTag(tag.name)}
                          style={
                            isSelected ? {} : { borderColor: `${tag.color}50`, color: tag.color }
                          }
                        >
                          {tag.name} {isSelected && <Check className="w-3 h-3 ml-1" />}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                  <Label>Criar Tarefas Automaticamente</Label>

                  <div className="flex flex-col gap-2 p-3 bg-background border rounded-md shadow-sm">
                    <Input
                      placeholder="Título da tarefa..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Textarea
                      placeholder="Descrição (opcional)..."
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={addTask}
                      disabled={!taskTitle.trim()}
                      className="self-end mt-1"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Adicionar à lista
                    </Button>
                  </div>

                  {formData.autoTasks.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {formData.autoTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex justify-between items-start p-2 bg-card border rounded shadow-sm"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{t.title}</p>
                            {t.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {t.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTask(t.id)}
                            className="h-6 w-6 text-destructive shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-slate-900"
                disabled={!formData.name.trim()}
              >
                Salvar Etapa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ordem</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Automações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStages.map((stage, index) => (
              <TableRow key={stage.id}>
                <TableCell>
                  <div className="flex flex-col gap-1 items-center">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === sortedStages.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{stage.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {stage.autoTags.length > 0 && (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                        +{stage.autoTags.length} Tags
                      </span>
                    )}
                    {stage.autoTasks.length > 0 && (
                      <span className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-medium">
                        +{stage.autoTasks.length} Tarefas
                      </span>
                    )}
                    {stage.autoTags.length === 0 && stage.autoTasks.length === 0 && (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(stage)}>
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(stage)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
