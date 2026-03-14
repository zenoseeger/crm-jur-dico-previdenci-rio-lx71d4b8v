import React from 'react'
import { Clock, MessageCircle, MoreVertical } from 'lucide-react'
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
import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'

interface LeadCardProps {
  lead: Lead
  onOpen: () => void
}

export function LeadCard({ lead, onOpen }: LeadCardProps) {
  const { moveLead } = useLeadStore()
  const { pipelineStages } = useAdminStore()

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('leadId', lead.id)
  }

  const getHeatColor = (heat: string) => {
    switch (heat) {
      case 'Hot':
        return 'bg-destructive text-destructive-foreground'
      case 'Warm':
        return 'bg-warning text-warning-foreground'
      case 'Cold':
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

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onClick={onOpen}
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group border border-border/50',
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
          {lead.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 bg-background/50">
              {tag}
            </Badge>
          ))}
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
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{lead.timeInStage}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
