import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LeadProvider } from '@/stores/useLeadStore'
import { AdminProvider } from '@/stores/useAdminStore'
import { AuthProvider } from '@/stores/useAuthStore'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireAdmin } from '@/components/auth/RequireAdmin'

import Layout from './components/Layout'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Administration from './pages/Administration'
import Tasks from './pages/Tasks'
import NotFound from './pages/NotFound'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <AdminProvider>
          <LeadProvider>
            <Toaster />
            <Sonner position="top-center" expand={true} richColors />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                element={
                  <RequireAuth>
                    <Layout />
                  </RequireAuth>
                }
              >
                <Route path="/" element={<Index />} />
                <Route path="/tarefas" element={<Tasks />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/clientes" element={<Clients />} />
                <Route path="/relatorios" element={<Reports />} />
                <Route path="/configuracoes" element={<Settings />} />
                <Route
                  path="/administracao"
                  element={
                    <RequireAdmin>
                      <Administration />
                    </RequireAdmin>
                  }
                />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </LeadProvider>
        </AdminProvider>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
