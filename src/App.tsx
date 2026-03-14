import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LeadProvider } from '@/stores/useLeadStore'
import { AdminProvider } from '@/stores/useAdminStore'

import Layout from './components/Layout'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Administration from './pages/Administration'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <AdminProvider>
        <LeadProvider>
          <Toaster />
          <Sonner position="top-center" expand={true} richColors />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/configuracoes" element={<Settings />} />
              <Route path="/administracao" element={<Administration />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LeadProvider>
      </AdminProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
