import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  BarChart3,
  Settings,
  Scale,
  ShieldCheck,
  ListTodo,
  LogOut,
  MessageSquare,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { LogoutConfirm } from '@/components/auth/LogoutConfirm'
import { useAuthStore } from '@/stores/useAuthStore'

const navItems = [
  { title: 'Pipeline', path: '/', icon: KanbanSquare },
  { title: 'Conversas', path: '/conversas', icon: MessageSquare },
  { title: 'Tarefas', path: '/tarefas', icon: ListTodo },
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Clientes', path: '/clientes', icon: Users },
  { title: 'Relatórios', path: '/relatorios', icon: BarChart3 },
  { title: 'Configurações', path: '/configuracoes', icon: Settings },
  { title: 'Administração', path: '/administracao', icon: ShieldCheck },
]

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'Admin'
  const isSuperAdmin = user?.email === 'zhseeger@gmail.com'

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 w-full truncate">
          <div className="bg-slate-900 text-amber-500 p-1.5 rounded-md flex-shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="font-bold tracking-tight dark:text-slate-100 truncate text-[#e1e1e1] leading-tight shadow-[0px_0px_6px_0px_#101c3f]">
              PreviCRM
            </span>
            <span
              className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5 font-medium"
              title={(user as any)?.companyName}
            >
              {(user as any)?.companyName || 'Meu Escritório'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Comercial & Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((item) => item.path !== '/administracao' || isAdmin)
                .map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                      tooltip={item.title}
                    >
                      <Link to={item.path}>
                        <item.icon
                          className={cn(
                            'w-4 h-4',
                            location.pathname === item.path ? 'text-amber-600' : '',
                          )}
                        />
                        <span className={cn(location.pathname === item.path ? 'font-medium' : '')}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

              {isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/master'}
                    tooltip="Master Admin"
                  >
                    <Link to="/master">
                      <Building2 className={cn('w-4 h-4 text-purple-500')} />
                      <span
                        className={cn(
                          location.pathname === '/master'
                            ? 'font-medium text-purple-600 dark:text-purple-400'
                            : 'text-purple-600 dark:text-purple-400',
                        )}
                      >
                        Painel Master
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <LogoutConfirm>
              <SidebarMenuButton
                tooltip="Sair do sistema"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:justify-center"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair do sistema</span>
              </SidebarMenuButton>
            </LogoutConfirm>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
