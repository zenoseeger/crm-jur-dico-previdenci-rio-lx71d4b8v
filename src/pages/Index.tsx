import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default function Index() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col">
      <KanbanBoard />
    </div>
  )
}
