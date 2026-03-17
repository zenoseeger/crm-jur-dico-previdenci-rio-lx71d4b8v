import React, { useState, useEffect } from 'react'
import { useAdminStore } from '@/stores/useAdminStore'
import { useAuthStore } from '@/stores/useAuthStore'
import useLeadStore from '@/stores/useLeadStore'
import { PipelineStage, Pipeline } from '@/types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit2, Trash2, Plus, ArrowUp, ArrowDown, Settings, Check, X, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function PipelineManagement() {
  const {
    pipelines,
    addPipeline,
    updatePipeline,
    deletePipeline,
    pipelineStages,
    addPipelineStage,
    updatePipelineStage,
    deletePipelineStage,
    reorderPipelineStages,
    tags,
  } = useAdminStore()

  const { users, user: currentUser } = useAuthStore()
  const { updateLeadStageNames, leads } = useLeadStore()

  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('p1')

  useEffect(() => {
    if (pipelines.length > 0 && !pipelines.find((p) => p.id === selectedPipelineId)) {
      setSelectedPipelineId(pipelines[0].id)
    }
  }, [pipelines, selectedPipelineId])

  const activePipeline = pipelines.find((p) => p.id === selectedPipelineId)

  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false)
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null)
  const [pipelineFormData, setPipelineFormData] = useState({
    name: '',
    userIds: [] as string[],
    steps: ['NOVO LEAD', 'EM QUALIFICAÇÃO', 'GANHO'],
  })

  const [isOpen, setIsOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null)

  const [formData, setFormData] = useState<Omit<PipelineStage, 'id' | 'order'>>({
    name: '',
    pipelineId: '',
    autoTags: [],
    autoTasks: [],
  })

  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskDueDays, setTaskDueDays] = useState<number>(0)

  const handleOpenPipelineDialog = (p?: Pipeline) => {
    if (p) {
      setEditingPipeline(p)
      setPipelineFormData({ name: p.name, userIds: [...p.userIds], steps: [] })
    } else {
      setEditingPipeline(null)
      setPipelineFormData({
        name: '',
        userIds: currentUser ? [currentUser.id] : [],
        steps: ['NOVO LEAD', 'EM QUALIFICAÇÃO', 'GANHO'],
      })
    }
    setPipelineDialogOpen(true)
  }

  const submitPipeline = () => {
    if (!pipelineFormData.name.trim()) return
    if (editingPipeline) {
      updatePipeline(editingPipeline.id, {
        name: pipelineFormData.name,
        userIds: pipelineFormData.userIds,
      })
    } else {
      const newId = addPipeline(
        { name: pipelineFormData.name, userIds: pipelineFormData.userIds },
        pipelineFormData.steps,
      )
      setSelectedPipelineId(newId)
    }
    setPipelineDialogOpen(false)
  }

  const handleDeletePipeline = () => {
    if (!activePipeline) return
    const leadsInPipeline = leads.filter((l) => l.pipelineId === activePipeline.id).length
    if (leadsInPipeline > 0) {
      if (
        !window.confirm(
          `Este pipeline possui ${leadsInPipeline} leads vinculados. Excluir o pipeline fará com que esses leads fiquem sem board. Tem certeza?`,
        )
      ) {
        return
      }
    } else {
      if (!window.confirm(`Tem certeza que deseja excluir o pipeline "${activePipeline.name}"?`)) {
        return
      }
    }
    deletePipeline(activePipeline.id)
  }

  const handleOpenDialog = (stage?: PipelineStage) => {
    if (stage) {
      setEditingStage(stage)
      setFormData({
        name: stage.name,
        pipelineId: stage.pipelineId,
        autoTags: [...stage.autoTags],
        autoTasks: [...stage.autoTasks],
      })
    } else {
      setEditingStage(null)
      setFormData({ name: '', pipelineId: selectedPipelineId, autoTags: [], autoTasks: [] })
    }
    setTaskTitle('')
    setTaskDesc('')
    setTaskDueDays(0)
    setIsOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) return

    if (editingStage) {
      if (editingStage.name !== formData.name) {
        updateLeadStageNames(editingStage.pipelineId, editingStage.name, formData.name)
      }
      updatePipelineStage(editingStage.id, formData)
    } else {
      addPipelineStage({ ...formData, pipelineId: selectedPipelineId })
    }
    setIsOpen(false)
  }

  const handleDelete = (stage: PipelineStage) => {
    const leadsInStage = leads.filter(
      (l) => l.stage === stage.name && l.pipelineId === stage.pipelineId,
    ).length
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

  const activeStages = pipelineStages
    .filter((s) => s.pipelineId === selectedPipelineId)
    .sort((a, b) => a.order - b.order)

  const moveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...activeStages]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    reorderPipelineStages(newOrder.map((s) => s.id))
  }

  const moveDown = (index: number) => {
    if (index === activeStages.length - 1) return
    const newOrder = [...activeStages]
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
        {
          id: `tpl_${Date.now()}`,
          title: taskTitle,
          description: taskDesc,
          dueInDays: taskDueDays,
        },
      ],
    }))
    setTaskTitle('')
    setTaskDesc('')
    setTaskDueDays(0)
  }

  const removeTask = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      autoTasks: prev.autoTasks.filter((t) => t.id !== id),
    }))
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle>Gestão de Pipelines</CardTitle>
          <CardDescription>
            Organize diferentes fluxos de trabalho e controle os acessos da equipe.
          </CardDescription>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="space-y-1.5 flex-1 max-w-sm">
            <Label>Pipeline Selecionado</Label>
            <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleOpenPipelineDialog(activePipeline)}
              disabled={!activePipeline}
              className="bg-background"
            >
              <Edit2 className="w-4 h-4 mr-2" /> Editar Acessos
            </Button>
            <Button
              onClick={() => handleOpenPipelineDialog()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Pipeline
            </Button>
            <Button
              variant="ghost"
              onClick={handleDeletePipeline}
              disabled={!activePipeline || pipelines.length <= 1}
              className="text-destructive hover:bg-destructive/10"
              title="Excluir Pipeline"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activePipeline && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-semibold text-sm">Etapas (Steps) do Pipeline</h3>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => handleOpenDialog()} variant="secondary">
                    <Plus className="w-4 h-4 mr-2" /> Nova Etapa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingStage ? 'Editar Etapa' : 'Criar Nova Etapa no Pipeline'}
                    </DialogTitle>
                    <DialogDescription>
                      Defina as ações que ocorrerão automaticamente quando um lead for movido para
                      cá.
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
                                  isSelected
                                    ? {}
                                    : { borderColor: `${tag.color}50`, color: tag.color }
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
                          <div className="flex gap-2">
                            <Input
                              placeholder="Título da tarefa..."
                              value={taskTitle}
                              onChange={(e) => setTaskTitle(e.target.value)}
                              className="h-8 text-sm flex-1"
                            />
                            <div className="flex items-center gap-2 shrink-0">
                              <Label className="text-xs whitespace-nowrap">Prazo (Dias):</Label>
                              <Input
                                type="number"
                                min="0"
                                value={taskDueDays}
                                onChange={(e) => setTaskDueDays(Number(e.target.value))}
                                className="h-8 w-16 text-sm"
                              />
                            </div>
                          </div>
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
                                <div className="space-y-1 flex-1 pr-4">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">{t.title}</p>
                                    <Badge variant="outline" className="text-[10px] h-4 px-1 gap-1">
                                      <Clock className="w-3 h-3" /> {t.dueInDays} dias
                                    </Badge>
                                  </div>
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
            </div>
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
                {activeStages.map((stage, index) => (
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
                          disabled={index === activeStages.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="text-muted-foreground mr-2">{index + 1}.</span>
                      {stage.name}
                    </TableCell>
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
          </div>
        )}
      </CardContent>

      <Dialog open={pipelineDialogOpen} onOpenChange={setPipelineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPipeline ? 'Editar Pipeline' : 'Novo Pipeline'}</DialogTitle>
            <DialogDescription>
              Configure o nome e defina quais usuários podem visualizá-lo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Pipeline</Label>
              <Input
                value={pipelineFormData.name}
                onChange={(e) => setPipelineFormData({ ...pipelineFormData, name: e.target.value })}
                placeholder="Ex: Aposentadoria Especial"
              />
            </div>
            <div className="space-y-2">
              <Label>Usuários com Acesso</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-3 max-h-[150px] overflow-y-auto bg-muted/10">
                {users.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 p-2 border border-transparent hover:border-border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-muted-foreground text-primary focus:ring-primary w-4 h-4"
                      checked={pipelineFormData.userIds.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPipelineFormData((prev) => ({
                            ...prev,
                            userIds: [...prev.userIds, u.id],
                          }))
                        } else {
                          setPipelineFormData((prev) => ({
                            ...prev,
                            userIds: prev.userIds.filter((id) => id !== u.id),
                          }))
                        }
                      }}
                    />
                    <span className="text-sm font-medium truncate flex-1">{u.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{u.role}</span>
                  </label>
                ))}
              </div>
            </div>

            {!editingPipeline && (
              <div className="space-y-3 pt-4 border-t">
                <Label>Passos Iniciais (Etapas numeradas)</Label>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
                  {pipelineFormData.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-xs text-muted-foreground font-medium text-right">
                        {idx + 1}.
                      </span>
                      <Input
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...pipelineFormData.steps]
                          newSteps[idx] = e.target.value
                          setPipelineFormData((prev) => ({ ...prev, steps: newSteps }))
                        }}
                        className="h-8 text-sm"
                        placeholder="Nome da etapa"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive shrink-0"
                        onClick={() => {
                          setPipelineFormData((prev) => ({
                            ...prev,
                            steps: prev.steps.filter((_, i) => i !== idx),
                          }))
                        }}
                        disabled={pipelineFormData.steps.length <= 1}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPipelineFormData((prev) => ({
                      ...prev,
                      steps: [...prev.steps, `Passo ${prev.steps.length + 1}`],
                    }))
                  }
                  className="w-full border-dashed"
                >
                  <Plus className="w-3 h-3 mr-2" /> Adicionar Novo Passo
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPipelineDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitPipeline} disabled={!pipelineFormData.name.trim()}>
              Salvar Pipeline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
