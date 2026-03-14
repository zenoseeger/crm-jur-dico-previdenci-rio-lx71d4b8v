import React, { useState } from 'react'
import useLeadStore from '@/stores/useLeadStore'
import { KanbanColumn } from './KanbanColumn'
import { LeadDrawer } from './LeadDrawer'
import { LostLeadDialog } from './LostLeadDialog'
import { Stage } from '@/types'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-mobile'

const STAGES: Stage[] = [
  'NOVO LEAD',
  'EM QUALIFICAÇÃO',
  'AGUARDANDO DOCUMENTOS',
  'ANÁLISE JURÍDICA',
  'REUNIÃO DE FECHAMENTO',
  'CONTRATO ENVIADO',
  'CLIENTE ATIVO',
  'PERDIDO',
]

export function KanbanBoard() {
  const { leads, moveLead, setSelectedLead } = useLeadStore()
  const isMobile = useIsMobile()

  const [lostDialogOpen, setLostDialogOpen] = useState(false)
  const [pendingMove, setPendingMove] = useState<{ id: string; stage: Stage } | null>(null)

  const handleDrop = (leadId: string, toStage: Stage) => {
    if (toStage === 'PERDIDO') {
      setPendingMove({ id: leadId, stage: toStage })
      setLostDialogOpen(true)
    } else {
      moveLead(leadId, toStage)
    }
  }

  const confirmLost = (reason: string) => {
    if (pendingMove) {
      moveLead(pendingMove.id, pendingMove.stage, reason)
      setPendingMove(null)
    }
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-background p-4 animate-fade-in">
        <Tabs defaultValue={STAGES[0]} className="w-full flex-1 flex flex-col">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-transparent p-0 mb-4">
            {STAGES.map((stage) => (
              <TabsTrigger
                key={stage}
                value={stage}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-1.5 px-3 border border-border"
              >
                {stage} ({leads.filter((l) => l.stage === stage).length})
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-hidden relative">
            {STAGES.map((stage) => (
              <TabsContent
                key={stage}
                value={stage}
                className="h-full m-0 data-[state=inactive]:hidden outline-none"
              >
                <KanbanColumn
                  title={stage}
                  leads={leads.filter((l) => l.stage === stage)}
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
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              title={stage}
              leads={leads.filter((l) => l.stage === stage)}
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
