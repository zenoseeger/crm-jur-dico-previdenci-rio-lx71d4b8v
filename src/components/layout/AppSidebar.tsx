import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, KanbanSquare, Users, BarChart3, Settings, Scale } from 'lucide-react'
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
} from '@/components/ui/sidebar'

const navItems = [
  { title: 'Pipeline', path: '/', icon: KanbanSquare },
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Clientes', path: '/clientes', icon: Users },
  { title: 'Relatórios', path: '/relatorios', icon: BarChart3 },
  { title: 'Configurações', path: '/configuracoes', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 w-full truncate">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-1.5 rounded-md flex-shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <span className="font-semibold tracking-tight text-sidebar-foreground truncate group-data-[collapsible=icon]:hidden">
            PreviCRM
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Comercial</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
