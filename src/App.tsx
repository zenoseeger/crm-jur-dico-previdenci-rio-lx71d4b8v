import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LeadProvider } from '@/stores/useLeadStore'
import { AdminProvider } from '@/stores/useAdminStore'
import { AuthProvider as StoreAuthProvider } from '@/stores/useAuthStore'
import { AuthProvider as SupabaseAuthProvider } from '@/hooks/use-auth'
import { ClientProvider } from '@/stores/useClientStore'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireAdmin } from '@/components/auth/RequireAdmin'
import { RequireSuperAdmin } from '@/components/auth/RequireSuperAdmin'

import Layout from './components/Layout'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Administration from './pages/Administration'
import SuperAdmin from './pages/SuperAdmin'
import Tasks from './pages/Tasks'
import Conversations from './pages/Conversations'
import NotFound from './pages/NotFound'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <SupabaseAuthProvider>
        <StoreAuthProvider>
          <TooltipProvider>
            <AdminProvider>
              <ClientProvider>
                <LeadProvider>
                  <Toaster />
                  <Sonner position="top-center" expand={true} richColors />
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                      path="/"
                      element={
                        <RequireAuth>
                          <Layout />
                        </RequireAuth>
                      }
                    >
                      <Route index element={<Index />} />
                      <Route path="conversas" element={<Conversations />} />
                      <Route path="tarefas" element={<Tasks />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="clientes" element={<Clients />} />
                      <Route path="relatorios" element={<Reports />} />
                      <Route path="configuracoes" element={<Settings />} />
                      <Route
                        path="administracao"
                        element={
                          <RequireAdmin>
                            <Administration />
                          </RequireAdmin>
                        }
                      />
                      <Route
                        path="super-admin"
                        element={
                          <RequireSuperAdmin>
                            <SuperAdmin />
                          </RequireSuperAdmin>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </LeadProvider>
              </ClientProvider>
            </AdminProvider>
          </TooltipProvider>
        </StoreAuthProvider>
      </SupabaseAuthProvider>
    </BrowserRouter>
  </ThemeProvider>
)

export default App
