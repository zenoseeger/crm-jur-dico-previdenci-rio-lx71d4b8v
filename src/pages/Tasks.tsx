import React, { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarClock, CheckCircle2 } from 'lucide-react'
import useLeadStore from '@/stores/useLeadStore'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type FilterType = 'all' | 'pending' | 'overdue' | 'completed'

export default function Tasks() {
  const { leads, toggleTask } = useLeadStore()
  const [filter, setFilter] = useState<FilterType>('pending')

  const allTasks = useMemo(() => {
    return leads
      .flatMap((lead) =>
        (lead.tasks || []).map((task) => ({ ...task, leadId: lead.id, leadName: lead.name })),
      )
      .sort((a, b) => {
        if (a.completed && !b.completed) return 1
        if (!a.completed && b.completed) return -1
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
        return dateA - dateB
      })
  }, [leads])

  const now = new Date()

  const filteredTasks = allTasks.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'completed') return t.completed
    if (filter === 'pending') return !t.completed
    if (filter === 'overdue') return !t.completed && t.dueDate && new Date(t.dueDate) < now
    return true
  })

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Tarefas</h1>
          <p className="text-muted-foreground">Monitore e execute as atividades do pipeline.</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="overdue" className="data-[state=active]:text-destructive">
            Atrasadas
          </TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="p-0">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
                <CheckCircle2 className="w-12 h-12 opacity-20" />
                <p>Nenhuma tarefa encontrada para este filtro.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 text-center">Status</TableHead>
                    <TableHead>Tarefa</TableHead>
                    <TableHead>Lead Associado</TableHead>
                    <TableHead>Prazo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const isOverdue =
                      task.dueDate && !task.completed && new Date(task.dueDate) < now

                    return (
                      <TableRow
                        key={`${task.leadId}-${task.id}`}
                        className={cn(task.completed && 'opacity-60')}
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.leadId, task.id)}
                            className="translate-y-[2px]"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className={cn(task.completed && 'line-through text-muted-foreground')}
                          >
                            {task.title}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{task.leadName}</TableCell>
                        <TableCell>
                          {task.dueDate ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                'gap-1',
                                isOverdue
                                  ? 'border-destructive/50 text-destructive bg-destructive/10'
                                  : 'text-muted-foreground',
                              )}
                            >
                              <CalendarClock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
