import React, { useState, useEffect } from 'react'
import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'
import { KanbanColumn } from './KanbanColumn'
import { LeadDrawer } from './LeadDrawer'
import { LostLeadDialog } from './LostLeadDialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { FolderKanban, Plus } from 'lucide-react'

export function KanbanBoard() {
  const { leads, currentPipelineId, setCurrentPipelineId, setSelectedLead, moveLead, addLead } =
    useLeadStore()
  const { pipelines, pipelineStages, currentUser } = useAdminStore()
  const isMobile = useIsMobile()

  const allowedPipelines = pipelines.filter((p) =>
    currentUser ? p.userIds.includes(currentUser.id) : true,
  )

  useEffect(() => {
    if (
      (!currentPipelineId || !allowedPipelines.find((p) => p.id === currentPipelineId)) &&
      allowedPipelines.length > 0
    ) {
      setCurrentPipelineId(allowedPipelines[0].id)
    }
  }, [allowedPipelines, currentPipelineId, setCurrentPipelineId])

  const [lostDialogOpen, setLostDialogOpen] = useState(false)
  const [pendingMove, setPendingMove] = useState<{ id: string; stage: string } | null>(null)
  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [newLead, setNewLead] = useState({ name: '', phone: '', email: '' })

  const activePipeline =
    allowedPipelines.find((p) => p.id === currentPipelineId) || allowedPipelines[0]

  const sortedStages = activePipeline
    ? pipelineStages
        .filter((s) => s.pipelineId === activePipeline.id)
        .sort((a, b) => a.order - b.order)
    : []

  const activeLeads = activePipeline ? leads.filter((l) => l.pipelineId === activePipeline.id) : []

  const [activeTab, setActiveTab] = useState(sortedStages[0]?.name || '')

  useEffect(() => {
    if (sortedStages.length > 0 && !sortedStages.find((s) => s.name === activeTab)) {
      setActiveTab(sortedStages[0].name)
    }
  }, [sortedStages, activeTab])

  const handleDrop = (leadId: string, toStageName: string) => {
    if (toStageName === 'PERDIDO') {
      setPendingMove({ id: leadId, stage: toStageName })
      setLostDialogOpen(true)
    } else {
      const targetStage = sortedStages.find((s) => s.name === toStageName)
      if (targetStage) {
        moveLead(leadId, targetStage.name, undefined, targetStage.autoTags, targetStage.autoTasks)
      } else {
        moveLead(leadId, toStageName)
      }
    }
  }

  const confirmLost = (reason: string) => {
    if (pendingMove) {
      const targetStage = sortedStages.find((s) => s.name === pendingMove.stage)
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

  const handleAddSubmit = () => {
    if (!newLead.name) return
    addLead({
      id: crypto.randomUUID(),
      name: newLead.name,
      phone: newLead.phone,
      email: newLead.email,
      pipelineId: activePipeline?.id || 'p1',
      stage: sortedStages[0]?.name || 'NOVO LEAD',
      heat: 'Morno',
      tags: [],
      timeInStage: '0m',
      unread: true,
      aiEnabled: true,
      aiTriggered: false,
      createdAt: new Date().toISOString(),
    })
    setAddLeadOpen(false)
    setNewLead({ name: '', phone: '', email: '' })
  }

  if (allowedPipelines.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground animate-fade-in">
        Você não possui acesso a nenhum pipeline no momento.
      </div>
    )
  }

  const AddLeadDialog = () => (
    <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
      <DialogTrigger asChild>
        {isMobile ? (
          <Button size="icon" className="shrink-0 bg-slate-900 text-white">
            <Plus className="w-4 h-4" />
          </Button>
        ) : (
          <Button size="sm" className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="w-4 h-4" /> Novo Lead
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Lead</DialogTitle>
          <DialogDescription>Adicione manualmente um novo contato ao pipeline.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Nome Completo *</Label>
            <Input
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              placeholder="Ex: João da Silva"
            />
          </div>
          <div className="grid gap-2">
            <Label>Telefone / WhatsApp</Label>
            <Input
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="grid gap-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              placeholder="joao@email.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAddLeadOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddSubmit} disabled={!newLead.name} className="bg-slate-900">
            Adicionar Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-background p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Select value={currentPipelineId || ''} onValueChange={setCurrentPipelineId}>
            <SelectTrigger className="w-full font-semibold">
              <SelectValue placeholder="Selecione um Pipeline" />
            </SelectTrigger>
            <SelectContent>
              {allowedPipelines.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AddLeadDialog />
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 flex flex-col"
        >
          <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-transparent p-0 mb-4">
            {sortedStages.map((stage) => (
              <TabsTrigger
                key={stage.id}
                value={stage.name}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-1.5 px-3 border border-border"
              >
                {stage.name} ({activeLeads.filter((l) => l.stage === stage.name).length})
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
                  leads={activeLeads.filter((l) => l.stage === stage.name)}
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
    <div className="flex flex-col h-full w-full bg-background/50 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 text-primary rounded-md">
            <FolderKanban className="w-5 h-5" />
          </div>
          <Select value={currentPipelineId || ''} onValueChange={setCurrentPipelineId}>
            <SelectTrigger className="w-[280px] h-9 font-semibold border-transparent bg-transparent shadow-none hover:bg-muted/50 focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Selecione um Pipeline" />
            </SelectTrigger>
            <SelectContent>
              {allowedPipelines.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AddLeadDialog />
      </div>

      <ScrollArea className="w-full flex-1" orientation="horizontal">
        <div className="flex h-full p-6 pb-2 gap-4">
          {sortedStages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              title={stage.name}
              leads={activeLeads.filter((l) => l.stage === stage.name)}
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
