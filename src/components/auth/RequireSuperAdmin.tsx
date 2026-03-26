import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export function RequireSuperAdmin({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && user && !user.isSuperAdmin) {
      toast.error('Acesso Bloqueado: Privilégios insuficientes.', {
        description: 'Esta área é restrita aos administradores globais do sistema.',
      })
    }
  }, [user, isLoading])

  if (isLoading) return null

  if (!user || !user.isSuperAdmin) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-10 animate-fade-in-up">
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Acesso Restrito a Super Admins</AlertTitle>
          <AlertDescription className="mt-2 text-sm leading-relaxed">
            Apenas administradores globais têm permissão para gerenciar inquilinos e contas
            multi-empresas do sistema.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex justify-center">
          <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
            <Link to="/">Voltar para o Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return children
}
