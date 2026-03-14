import React, { useState } from 'react'
import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'
import { KanbanColumn } from './KanbanColumn'
import { LeadDrawer } from './LeadDrawer'
import { LostLeadDialog } from './LostLeadDialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-mobile'

export function KanbanBoard() {
  const { leads, moveLead, setSelectedLead } = useLeadStore()
  const { pipelineStages } = useAdminStore()
  const isMobile = useIsMobile()

  const [lostDialogOpen, setLostDialogOpen] = useState(false)
  const [pendingMove, setPendingMove] = useState<{ id: string; stage: string } | null>(null)

  const sortedStages = [...pipelineStages].sort((a, b) => a.order - b.order)

  const handleDrop = (leadId: string, toStageName: string) => {
    if (toStageName === 'PERDIDO') {
      setPendingMove({ id: leadId, stage: toStageName })
      setLostDialogOpen(true)
    } else {
      const targetStage = pipelineStages.find((s) => s.name === toStageName)
      if (targetStage) {
        moveLead(leadId, targetStage.name, undefined, targetStage.autoTags, targetStage.autoTasks)
      } else {
        moveLead(leadId, toStageName)
      }
    }
  }

  const confirmLost = (reason: string) => {
    if (pendingMove) {
      const targetStage = pipelineStages.find((s) => s.name === pendingMove.stage)
      moveLead(
        pendingMove.id,
        pendingMove.stage,
        reason,
        targetStage?.autoTags,
        targetStage?.autoTasks,
      )
      setPendingMove(null)
    }
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-background p-4 animate-fade-in">
        <Tabs defaultValue={sortedStages[0]?.name || ''} className="w-full flex-1 flex flex-col">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-transparent p-0 mb-4">
            {sortedStages.map((stage) => (
              <TabsTrigger
                key={stage.id}
                value={stage.name}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-1.5 px-3 border border-border"
              >
                {stage.name} ({leads.filter((l) => l.stage === stage.name).length})
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-hidden relative">
            {sortedStages.map((stage) => (
              <TabsContent
                key={stage.id}
                value={stage.name}
                className="h-full m-0 data-[state=inactive]:hidden outline-none"
              >
                <KanbanColumn
                  title={stage.name}
                  leads={leads.filter((l) => l.stage === stage.name)}
                  onDrop={handleDrop}
                  onOpenLead={setSelectedLead}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
        <LeadDrawer />
        <LostLeadDialog
          open={lostDialogOpen}
          onOpenChange={setLostDialogOpen}
          onConfirm={confirmLost}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full bg-background/50 overflow-hidden animate-fade-in">
      <ScrollArea className="w-full h-full" orientation="horizontal">
        <div className="flex h-full p-6 pb-2 gap-4">
          {sortedStages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              title={stage.name}
              leads={leads.filter((l) => l.stage === stage.name)}
              onDrop={handleDrop}
              onOpenLead={setSelectedLead}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <LeadDrawer />
      <LostLeadDialog
        open={lostDialogOpen}
        onOpenChange={setLostDialogOpen}
        onConfirm={confirmLost}
      />
    </div>
  )
}
