import { Bell, Search, UserCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useLeadStore from '@/stores/useLeadStore'

export function Header() {
  const { searchQuery, setSearchQuery } = useLeadStore()

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger />
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads por nome, telefone..."
            className="pl-8 bg-muted/50 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <UserCircle className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        </Button>
      </div>
    </header>
  )
}
