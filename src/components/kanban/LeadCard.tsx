import React from 'react'
import { Clock, MessageCircle, MoreVertical, CalendarClock } from 'lucide-react'
import { Lead } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'

interface LeadCardProps {
  lead: Lead
  onOpen: () => void
}

export function LeadCard({ lead, onOpen }: LeadCardProps) {
  const { moveLead } = useLeadStore()
  const { pipelineStages, tags: adminTags } = useAdminStore()

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('leadId', lead.id)
  }

  const getHeatColor = (heat: string) => {
    switch (heat) {
      case 'Quente':
        return 'bg-destructive text-destructive-foreground'
      case 'Morno':
        return 'bg-warning text-warning-foreground'
      case 'Frio':
        return 'bg-muted-foreground text-secondary-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const handleMove = (e: React.MouseEvent, stageName: string) => {
    e.stopPropagation()
    const stage = pipelineStages.find((s) => s.name === stageName)
    moveLead(lead.id, stageName, undefined, stage?.autoTags, stage?.autoTasks)
  }

  const pendingTasks = lead.tasks?.filter((t) => !t.completed) || []
  const hasPending = pendingTasks.length > 0
  const now = new Date()
  const hasOverdue = pendingTasks.some((t) => t.dueDate && new Date(t.dueDate) < now)

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onClick={onOpen}
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow relative overflow-visible group border border-border/50',
        lead.unread ? 'bg-primary/5' : 'bg-card',
      )}
    >
      {lead.unread && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full m-3 animate-pulse" />
      )}

      <CardContent className="p-3 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1 pr-6">
            <h4 className="font-semibold text-sm leading-tight text-foreground truncate">
              {lead.name}
            </h4>
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <MessageCircle className="w-3 h-3 text-success" />
              <span>{lead.phone}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {pipelineStages
                .filter((s) => s.name !== lead.stage && s.name !== 'PERDIDO')
                .slice(0, 3)
                .map((stage) => (
                  <DropdownMenuItem key={stage.id} onClick={(e) => handleMove(e, stage.name)}>
                    Mover para {stage.name}
                  </DropdownMenuItem>
                ))}
              <DropdownMenuItem
                onClick={(e) => handleMove(e, 'PERDIDO')}
                className="text-destructive"
              >
                Marcar como Perdido
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className={cn('text-[10px] px-1.5 py-0', getHeatColor(lead.heat))}
          >
            {lead.heat}
          </Badge>
          {lead.tags.slice(0, 2).map((tag) => {
            const tagDef = adminTags.find((t) => t.name === tag)
            return (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] px-1.5 py-0"
                style={
                  tagDef
                    ? {
                        backgroundColor: `${tagDef.color}15`,
                        color: tagDef.color,
                        borderColor: `${tagDef.color}40`,
                      }
                    : { backgroundColor: 'var(--background)' }
                }
              >
                {tag}
              </Badge>
            )
          })}
          {lead.tags.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background/50">
              +{lead.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t pt-2">
          <span className="truncate max-w-[100px] font-medium text-foreground/70">
            {lead.assignee}
          </span>
          <div className="flex items-center gap-3 ml-auto">
            {hasPending && (
              <Tooltip>
                <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <div
                    className={cn(
                      'flex items-center gap-1 transition-colors cursor-help',
                      hasOverdue ? 'text-destructive font-bold' : 'text-amber-500 font-medium',
                    )}
                  >
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span>{pendingTasks.length}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] space-y-1 z-50">
                  <p className="font-semibold text-xs mb-1">Tarefas Pendentes</p>
                  {pendingTasks.slice(0, 3).map((t) => (
                    <p
                      key={t.id}
                      className={cn(
                        'text-[10px] truncate',
                        t.dueDate && new Date(t.dueDate) < now ? 'text-destructive' : '',
                      )}
                    >
                      - {t.title}
                    </p>
                  ))}
                  {pendingTasks.length > 3 && (
                    <p className="text-[10px] italic">+{pendingTasks.length - 3} mais</p>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
            <div className="flex items-center gap-1" title="Tempo na etapa">
              <Clock className="w-3 h-3 opacity-50" />
              <span>{lead.timeInStage}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
