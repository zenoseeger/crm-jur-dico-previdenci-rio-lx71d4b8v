import React, { useState } from 'react'
import { Lead } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useLeadStore from '@/stores/useLeadStore'
import { Plus, CheckCircle2, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TasksTab({ lead }: { lead: Lead }) {
  const { toggleTask, addTask } = useLeadStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    addTask(lead.id, {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      description: '',
      completed: false,
      createdAt: new Date().toISOString(),
    })
    setNewTaskTitle('')
  }

  const tasks = lead.tasks || []
  const now = new Date()

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Nova tarefa..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!newTaskTitle.trim()}
          className="bg-primary shrink-0"
        >
          <Plus className="w-4 h-4 text-primary-foreground" />
        </Button>
      </form>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground space-y-2">
          <CheckCircle2 className="w-8 h-8 opacity-20" />
          <p className="text-sm">Nenhuma tarefa pendente.</p>
        </div>
      ) : (
        <div className="space-y-3 pb-8">
          {tasks.map((task) => {
            const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < now

            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-card shadow-sm hover:border-primary/30 transition-colors animate-fade-in-up"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(lead.id, task.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      task.completed ? 'line-through text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    {task.title}
                  </p>
                  {task.dueDate && !task.completed && (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-[10px] font-medium mt-1',
                        isOverdue ? 'text-destructive' : 'text-muted-foreground',
                      )}
                    >
                      <CalendarClock className="w-3 h-3" />
                      <span>Vence: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap mt-1">
                      {task.description}
                    </p>
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
