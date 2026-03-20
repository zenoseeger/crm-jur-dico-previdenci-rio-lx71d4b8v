import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useLeadStore from '@/stores/useLeadStore'
import { ChatTab } from './tabs/ChatTab'
import { DocsTab } from './tabs/DocsTab'
import { SummaryTab, HistoryTab } from './tabs/InfoTabs'
import { TasksTab } from './tabs/TasksTab'
import { Badge } from '@/components/ui/badge'
import { LeadActions } from './LeadActions'

export function LeadDrawer() {
  const { selectedLead, setSelectedLead, markAsRead } = useLeadStore()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedLead(null)
    }
  }

  React.useEffect(() => {
    if (selectedLead && selectedLead.unread) {
      markAsRead(selectedLead.id)
    }
  }, [selectedLead])

  if (!selectedLead) return null

  return (
    <Sheet open={!!selectedLead} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col h-[100dvh] overflow-hidden bg-background">
        <SheetHeader className="p-6 pb-4 border-b shrink-0 bg-muted/10">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-2xl text-foreground">{selectedLead.name}</SheetTitle>
              <SheetDescription asChild>
                <div className="flex items-center gap-2 mt-1">
                  <span>{selectedLead.phone}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <Badge variant="outline" className="font-normal bg-background">
                    {selectedLead.stage}
                  </Badge>
                </div>
              </SheetDescription>
            </div>
            <LeadActions lead={selectedLead} />
          </div>
        </SheetHeader>

        <Tabs
          defaultValue="summary"
          className="flex-1 flex flex-col min-h-0 overflow-hidden w-full"
        >
          <div className="px-6 border-b shrink-0 bg-background">
            <TabsList className="w-full justify-start h-12 bg-transparent gap-6 p-0 overflow-x-auto no-scrollbar pb-px">
              <TabsTrigger
                value="summary"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 data-[state=active]:shadow-none bg-transparent"
              >
                Resumo
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 data-[state=active]:shadow-none bg-transparent"
              >
                Conversa
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 data-[state=active]:shadow-none bg-transparent"
              >
                Tarefas{' '}
                {selectedLead.tasks &&
                  selectedLead.tasks.filter((t) => !t.completed).length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 px-1.5 py-0 bg-primary/20 text-primary border-transparent h-4 text-[10px]"
                    >
                      {selectedLead.tasks.filter((t) => !t.completed).length}
                    </Badge>
                  )}
              </TabsTrigger>
              <TabsTrigger
                value="docs"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 data-[state=active]:shadow-none bg-transparent"
              >
                Documentos
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 data-[state=active]:shadow-none bg-transparent"
              >
                Histórico
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto bg-background/50">
            <TabsContent
              value="summary"
              className="m-0 p-6 h-full focus-visible:outline-none animate-fade-in"
            >
              <SummaryTab lead={selectedLead} />
            </TabsContent>
            <TabsContent
              value="chat"
              className="m-0 p-6 h-full focus-visible:outline-none animate-fade-in"
            >
              <ChatTab lead={selectedLead} />
            </TabsContent>
            <TabsContent
              value="tasks"
              className="m-0 p-6 h-full focus-visible:outline-none animate-fade-in"
            >
              <TasksTab lead={selectedLead} />
            </TabsContent>
            <TabsContent
              value="docs"
              className="m-0 p-6 h-full focus-visible:outline-none animate-fade-in"
            >
              <DocsTab lead={selectedLead} />
            </TabsContent>
            <TabsContent
              value="history"
              className="m-0 p-6 h-full focus-visible:outline-none animate-fade-in"
            >
              <HistoryTab />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
