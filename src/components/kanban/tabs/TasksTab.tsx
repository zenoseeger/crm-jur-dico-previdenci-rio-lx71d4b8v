import React, { useState } from 'react'
import { Lead } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'
import {
  Plus,
  CheckCircle2,
  CalendarClock,
  CalendarIcon,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function TasksTab({ lead }: { lead: Lead }) {
  const { toggleTask, addTask } = useLeadStore()
  const { aiConfig } = useAdminStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>(undefined)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const aiDisabled = !aiConfig.enabled || lead.aiEnabled === false

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    addTask(lead.id, {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: newTaskDate ? newTaskDate.toISOString() : undefined,
    })

    setNewTaskTitle('')
    setNewTaskDesc('')
    setNewTaskDate(undefined)
  }

  const generateAIFollowUp = () => {
    if (aiDisabled) return

    setIsGeneratingAI(true)
    setTimeout(() => {
      setNewTaskTitle(`Follow-up de Contato: ${lead.stage}`)
      setNewTaskDesc(
        `Olá ${lead.name}, tudo bem? Aqui é do escritório de advocacia previdenciária. Estou entrando em contato pois vi que o seu processo referente a ${lead.benefitType} encontra-se na fase de ${lead.stage}. Podemos agendar um breve bate-papo para alinhar os próximos passos e eventuais documentações?`,
      )
      setIsGeneratingAI(false)
    }, 1200)
  }

  const tasks = lead.tasks || []
  const now = new Date()

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="space-y-3 p-4 border rounded-lg bg-card/50 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <div className="text-sm font-medium">Nova Tarefa</div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateAIFollowUp}
            disabled={isGeneratingAI || aiDisabled}
            title={aiDisabled ? 'Agente IA está desativado' : ''}
            className="h-7 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-all disabled:opacity-50"
          >
            {isGeneratingAI ? (
              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3 mr-1.5" />
            )}
            Gerar Follow-up com IA
          </Button>
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Título da tarefa (obrigatório)"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="bg-background"
          />
          <Textarea
            placeholder="Descrição ou notas adicionais..."
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            className="min-h-[80px] bg-background resize-none"
          />
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'flex-1 justify-start text-left font-normal bg-background',
                    !newTaskDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newTaskDate ? (
                    format(newTaskDate, 'PPP', { locale: ptBR })
                  ) : (
                    <span>Definir prazo</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newTaskDate}
                  onSelect={setNewTaskDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button type="submit" disabled={!newTaskTitle.trim()} className="bg-primary shrink-0">
              <Plus className="w-4 h-4 mr-2 text-primary-foreground" />
              Adicionar
            </Button>
          </div>
        </div>
      </form>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground space-y-2">
          <CheckCircle2 className="w-8 h-8 opacity-20" />
          <div className="text-sm">Nenhuma tarefa pendente.</div>
        </div>
      ) : (
        <div className="space-y-3 pb-8">
          {tasks.map((task) => {
            const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < now

            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-start gap-3 p-3 border rounded-lg bg-card shadow-sm transition-colors animate-fade-in-up',
                  isOverdue ? 'border-destructive/50 bg-destructive/5' : 'hover:border-primary/30',
                )}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(lead.id, task.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        'text-sm font-medium transition-colors',
                        task.completed ? 'line-through text-muted-foreground' : 'text-foreground',
                      )}
                    >
                      {task.title}
                    </div>
                    {isOverdue && <Clock className="w-4 h-4 text-destructive shrink-0" />}
                  </div>

                  {task.description && (
                    <div
                      className={cn(
                        'text-xs leading-relaxed whitespace-pre-wrap mt-1',
                        task.completed ? 'text-muted-foreground/60' : 'text-muted-foreground',
                      )}
                    >
                      {task.description}
                    </div>
                  )}

                  {task.dueDate && (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-[10px] font-medium mt-2',
                        isOverdue ? 'text-destructive' : 'text-muted-foreground',
                        task.completed && 'text-muted-foreground/60',
                      )}
                    >
                      <CalendarClock className="w-3 h-3" />
                      <span>
                        {task.completed ? 'Concluída' : 'Vence:'}{' '}
                        {format(new Date(task.dueDate), 'PPP', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
