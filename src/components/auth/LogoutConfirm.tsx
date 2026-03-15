import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface LogoutConfirmProps {
  children: React.ReactNode
}

export function LogoutConfirm({ children }: LogoutConfirmProps) {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleConfirm = () => {
    logout()
    navigate('/login')
    toast.info('Sessão encerrada com sucesso.')
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja sair?</AlertDialogTitle>
          <AlertDialogDescription>
            Ao sair, você precisará de suas credenciais para acessar o CRM novamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sair
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
