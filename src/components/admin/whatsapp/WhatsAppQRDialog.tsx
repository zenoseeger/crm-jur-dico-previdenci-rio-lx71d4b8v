import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'

interface QRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading: boolean
  error: string | null
  image: string | null
  requiresReset: boolean
  onConnectRetry: () => void
  onReset: () => void
}

export function WhatsAppQRDialog({
  open,
  onOpenChange,
  loading,
  error,
  image,
  requiresReset,
  onConnectRetry,
  onReset,
}: QRDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code abaixo com o seu WhatsApp para conectar a instância Z-api.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
            </div>
          ) : error ? (
            <div className="text-center space-y-6 w-full animate-in fade-in zoom-in-95 duration-200">
              <Alert
                variant="destructive"
                className="text-left bg-destructive/5 border-destructive/20 text-destructive shadow-sm"
              >
                <AlertTitle className="flex items-center gap-2 font-semibold text-base mb-2">
                  <AlertCircle className="w-5 h-5" /> Falha na Conexão
                </AlertTitle>
                <AlertDescription className="text-destructive/90 text-sm flex flex-col gap-4">
                  <div className="bg-destructive/10 p-3 rounded border border-destructive/20 font-medium">
                    A instância retornou um erro: {error}
                  </div>
                  {requiresReset && (
                    <Button
                      onClick={onReset}
                      variant="outline"
                      className="w-full border-destructive/40 hover:bg-destructive text-destructive hover:text-white transition-colors"
                    >
                      Forçar Reinicialização da Instância
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
              {!requiresReset && (
                <Button variant="outline" onClick={onConnectRetry} className="w-full h-11">
                  Tentar Novamente
                </Button>
              )}
            </div>
          ) : image ? (
            <div className="space-y-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <img src={image} alt="QR Code" className="w-64 h-64 object-contain" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Aguardando leitura...
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
