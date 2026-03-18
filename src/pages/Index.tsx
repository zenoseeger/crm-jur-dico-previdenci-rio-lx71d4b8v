import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import useLeadStore from '@/stores/useLeadStore'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function Index() {
  const { isLoading, error, fetchLeads } = useLeadStore()

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col p-6 gap-4 animate-fade-in">
        <div className="flex items-center justify-between py-2 border-b bg-background/80 backdrop-blur-sm">
          <Skeleton className="h-9 w-[280px] rounded-md" />
        </div>
        <div className="flex flex-1 gap-4 overflow-hidden mt-2">
          <Skeleton className="h-full w-80 rounded-xl shrink-0" />
          <Skeleton className="h-full w-80 rounded-xl shrink-0" />
          <Skeleton className="h-full w-80 rounded-xl shrink-0" />
          <Skeleton className="h-full w-80 rounded-xl shrink-0" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center p-6 bg-muted/20 animate-fade-in">
        <div className="flex flex-col items-center justify-center p-8 bg-card border rounded-lg shadow-sm max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar dados</h2>
          <p className="text-muted-foreground mb-6 text-sm">{error}</p>
          <Button
            onClick={() => fetchLeads()}
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
          >
            <RefreshCcw className="w-4 h-4" /> Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col">
      <KanbanBoard />
    </div>
  )
}
