import {
  Bell,
  Search,
  UserCircle,
  User as UserIcon,
  LogOut,
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sun,
  Moon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useLeadStore from '@/stores/useLeadStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { LogoutConfirm } from '@/components/auth/LogoutConfirm'
import { NewLeadDialog } from '@/components/kanban/NewLeadDialog'
import { useWhatsAppStatus } from '@/hooks/use-whatsapp-status'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { searchQuery, setSearchQuery } = useLeadStore()
  const { user } = useAuthStore()
  const waStatus = useWhatsAppStatus()
  const { theme, setTheme, resolvedTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-20 transition-colors">
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

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center mr-2" title="Status do WhatsApp Integrado">
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors',
              waStatus === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : waStatus === 'error'
                  ? 'bg-destructive/10 border-destructive/20 text-destructive'
                  : waStatus === 'checking'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500',
            )}
          >
            {waStatus === 'connected' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : waStatus === 'error' ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : waStatus === 'checking' ? (
              <AlertCircle className="w-3.5 h-3.5 opacity-50" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            <span>
              {waStatus === 'connected'
                ? 'WA Ativo'
                : waStatus === 'error'
                  ? 'WA Erro'
                  : waStatus === 'checking'
                    ? '...'
                    : 'WA Offline'}
            </span>
          </div>
        </div>

        <NewLeadDialog>
          <Button size="sm" className="h-9">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Novo Lead</span>
          </Button>
        </NewLeadDialog>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-slate-300" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserCircle className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Administrador'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'admin@exemplo.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <LogoutConfirm>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair do sistema</span>
              </DropdownMenuItem>
            </LogoutConfirm>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
