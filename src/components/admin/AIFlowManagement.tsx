import React, { useState } from 'react'
import { useAdminStore } from '@/stores/useAdminStore'
import { AIFlow } from '@/types'
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
import { Edit2, Trash2, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AIFlowManagement() {
  const { aiFlows, tags, addAIFlow, updateAIFlow, deleteAIFlow } = useAdminStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingFlow, setEditingFlow] = useState<AIFlow | null>(null)

  const [formData, setFormData] = useState<Omit<AIFlow, 'id'>>({
    name: '',
    triggerTagName: '',
    steps: [{ id: `s${Date.now()}`, order: 1, prompt: '', dueInDays: 1 }],
  })

  const handleOpenDialog = (flow?: AIFlow) => {
    if (flow) {
      setEditingFlow(flow)
      setFormData({ name: flow.name, triggerTagName: flow.triggerTagName, steps: [...flow.steps] })
    } else {
      setEditingFlow(null)
      setFormData({
        name: '',
        triggerTagName: '',
        steps: [{ id: `s${Date.now()}`, order: 1, prompt: '', dueInDays: 1 }],
      })
    }
    setIsOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.triggerTagName) return
    if (editingFlow) updateAIFlow(editingFlow.id, formData)
    else addAIFlow(formData)
    setIsOpen(false)
  }

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { id: `s${Date.now()}`, order: prev.steps.length + 1, prompt: '', dueInDays: 1 },
      ],
    }))
  }

  const updateStep = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newSteps = [...prev.steps]
      newSteps[index] = { ...newSteps[index], [field]: value }
      return { ...prev, steps: newSteps }
    })
  }

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })),
    }))
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Fluxos de Follow-up com IA</CardTitle>
          <CardDescription>
            Crie sequências de tarefas automatizadas disparadas por tags.
          </CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Fluxo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFlow ? 'Editar Fluxo IA' : 'Criar Fluxo IA'}</DialogTitle>
              <DialogDescription>
                Mapeie uma tag para iniciar uma sequência de tarefas de follow-up geradas por IA.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Fluxo</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Cadência de Boas Vindas"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tag Gatilho</Label>
                  <Select
                    value={formData.triggerTagName}
                    onValueChange={(v) => setFormData({ ...formData, triggerTagName: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.map((t) => (
                        <SelectItem key={t.id} value={t.name}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label>Passos do Follow-up</Label>
                {formData.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="border p-4 rounded-lg space-y-3 bg-muted/20 relative"
                  >
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-background">
                        {step.order}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => removeStep(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Atraso (dias):</Label>
                      <Input
                        type="number"
                        min="0"
                        value={step.dueInDays}
                        onChange={(e) => updateStep(idx, 'dueInDays', Number(e.target.value))}
                        className="w-20 h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Prompt para a IA (Instruções para gerar a mensagem/tarefa)
                      </Label>
                      <Textarea
                        value={step.prompt}
                        onChange={(e) => updateStep(idx, 'prompt', e.target.value)}
                        className="min-h-[80px] text-sm resize-none"
                        placeholder="Ex: Gere uma mensagem curta lembrando o cliente sobre os documentos."
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  className="w-full border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Passo
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-slate-900"
                disabled={!formData.name || !formData.triggerTagName}
              >
                Salvar Fluxo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Gatilho</TableHead>
              <TableHead>Passos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aiFlows.map((flow) => (
              <TableRow key={flow.id}>
                <TableCell className="font-medium">{flow.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{flow.triggerTagName}</Badge>
                </TableCell>
                <TableCell>{flow.steps.length} etapas</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(flow)}>
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteAIFlow(flow.id)}>
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
