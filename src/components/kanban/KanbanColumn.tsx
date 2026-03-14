import React from 'react'
import { Stage, Lead } from '@/types'
import { LeadCard } from './LeadCard'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface KanbanColumnProps {
  title: Stage
  leads: Lead[]
  onDrop: (leadId: string, stage: Stage) => void
  onOpenLead: (lead: Lead) => void
}

export function KanbanColumn({ title, leads, onDrop, onOpenLead }: KanbanColumnProps) {
  const [isOver, setIsOver] = React.useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) {
      onDrop(leadId, title)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col flex-shrink-0 w-80 max-h-full rounded-lg transition-colors duration-200 border border-border/50',
        isOver ? 'bg-accent/10 border-accent/30' : 'bg-muted/30',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-3 border-b border-border/50 flex items-center justify-between bg-background/50 rounded-t-lg backdrop-blur-sm sticky top-0 z-10">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <Badge variant="secondary" className="bg-background text-foreground shadow-sm">
          {leads.length}
        </Badge>
      </div>

      <div className="flex-1 overflow-hidden p-2">
        <ScrollArea className="h-full w-full pr-3 pb-4">
          <div className="flex flex-col gap-2 min-h-[100px]">
            {leads.length === 0 && (
              <div className="h-24 border-2 border-dashed border-border/60 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                Arraste leads para cá
              </div>
            )}
            {leads.map((lead) => (
              <div key={lead.id} className="animate-fade-in-up">
                <LeadCard lead={lead} onOpen={() => onOpenLead(lead)} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
