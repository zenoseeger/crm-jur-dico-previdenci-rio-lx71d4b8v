import React, { useState, useEffect } from 'react'
import { useAdminStore } from '@/stores/useAdminStore'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  QrCode,
  Smartphone,
  LogOut,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'

const QR_TIMEOUT = 30

export function WhatsAppWebConfig() {
  const { whatsAppConfig, updateWhatsAppConfig } = useAdminStore()
  const [timeLeft, setTimeLeft] = useState(QR_TIMEOUT)
  const [errorMsg, setErrorMsg] = useState('')

  const status = whatsAppConfig.webSessionStatus

  useEffect(() => {
    if (status !== 'awaiting_scan') return
    setTimeLeft(QR_TIMEOUT)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          updateWhatsAppConfig({ webSessionStatus: 'error' })
          setErrorMsg('O código QR expirou por inatividade. Por favor, gere um novo código.')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [status, updateWhatsAppConfig])

  const generateQR = () => {
    updateWhatsAppConfig({ webSessionStatus: 'authenticating' })
    setErrorMsg('')
    setTimeout(() => {
      updateWhatsAppConfig({ webSessionStatus: 'awaiting_scan' })
    }, 2500)
  }

  const simulateScan = () => {
    updateWhatsAppConfig({
      webSessionStatus: 'connected',
      webProfileName: 'Atendimento CRM Previdenciário',
      webProfilePhone: '+55 11 99999-9999',
    })
    toast.success('Dispositivo vinculado com sucesso!')
  }

  const simulateError = () => {
    updateWhatsAppConfig({ webSessionStatus: 'error' })
    setErrorMsg('Conexão rejeitada pelo aparelho ou instabilidade na rede. Tente novamente.')
  }

  const disconnectWeb = () => {
    updateWhatsAppConfig({ webSessionStatus: 'disconnected' })
    toast.success('Sessão do WhatsApp encerrada.')
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-muted/20 animate-fade-in text-center min-h-[340px] transition-all duration-300">
      {status === 'disconnected' && (
        <div className="space-y-4 animate-fade-in-up flex flex-col items-center">
          <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center shadow-inner border border-[#25D366]/20">
            <QrCode className="w-8 h-8 text-[#25D366]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Vincular Dispositivo</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Utilize o seu aplicativo do WhatsApp para ler o código QR e conectar a plataforma.
            </p>
          </div>
          <Button
            onClick={generateQR}
            className="bg-[#25D366] hover:bg-[#1DA851] text-white gap-2 mt-2 px-6"
          >
            <QrCode className="w-4 h-4" /> Gerar Código QR
          </Button>
        </div>
      )}

      {status === 'authenticating' && (
        <div className="space-y-6 text-center animate-fade-in w-full max-w-xs">
          <div className="relative w-48 h-48 mx-auto">
            <Skeleton className="w-full h-full rounded-xl" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[2px] rounded-xl border border-border">
              <Loader2 className="w-10 h-10 animate-spin text-[#25D366] mb-2" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Gerando sessão...
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Conectando aos servidores...</p>
            <Progress value={undefined} className="h-1.5 w-full bg-muted" />
          </div>
        </div>
      )}

      {status === 'awaiting_scan' && (
        <div className="space-y-5 flex flex-col items-center animate-fade-in w-full max-w-[280px]">
          <div className="p-3 bg-white rounded-xl shadow-sm border relative group overflow-hidden">
            <div className="relative inline-block">
              <img
                src="https://img.usecurling.com/p/250/250?q=qr%20code%20pattern&color=black"
                alt="WhatsApp QR Code"
                className="w-48 h-48 object-cover opacity-90 mix-blend-multiply"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white p-1.5 rounded-full shadow-md">
                  <img
                    src="https://img.usecurling.com/i?q=whatsapp&color=green"
                    className="w-7 h-7"
                    alt="WhatsApp"
                  />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
              <Button
                size="sm"
                onClick={simulateScan}
                className="bg-[#25D366] hover:bg-[#1DA851] text-white w-32"
              >
                Simular Scan
              </Button>
              <Button size="sm" variant="destructive" onClick={simulateError} className="w-32">
                Simular Erro
              </Button>
            </div>
          </div>
          <div className="w-full space-y-2 bg-background p-3 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-muted-foreground">Expira em</span>
              <span
                className={
                  timeLeft < 10
                    ? 'text-destructive font-bold animate-pulse'
                    : 'text-slate-700 dark:text-slate-300'
                }
              >
                00:{timeLeft.toString().padStart(2, '0')}
              </span>
            </div>
            <Progress value={(timeLeft / QR_TIMEOUT) * 100} className="h-2 [&>div]:bg-[#25D366]" />
          </div>
          <p className="text-xs text-muted-foreground text-center px-4">
            Abra o WhatsApp no seu celular, vá em <strong>Aparelhos Conectados</strong> e aponte a
            câmera.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4 animate-fade-in w-full max-w-md">
          <Alert variant="destructive" className="text-left bg-destructive/5 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Conexão Falhou</AlertTitle>
            <AlertDescription className="mt-1 text-xs leading-relaxed">{errorMsg}</AlertDescription>
          </Alert>
          <div className="flex justify-center gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => updateWhatsAppConfig({ webSessionStatus: 'disconnected' })}
            >
              Cancelar
            </Button>
            <Button
              onClick={generateQR}
              className="bg-[#25D366] hover:bg-[#1DA851] text-white gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Gerar Novo QR
            </Button>
          </div>
        </div>
      )}

      {status === 'connected' && (
        <div className="space-y-6 w-full max-w-sm animate-fade-in-up">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center shrink-0 border border-[#25D366]/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                Aparelho Vinculado
              </h3>
              <p className="text-sm text-[#25D366] font-medium">Sessão ativa e operacional</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border rounded-xl bg-background shadow-sm text-left">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {whatsAppConfig.webProfileName}
              </p>
              <p className="text-sm text-muted-foreground">{whatsAppConfig.webProfilePhone}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors border-destructive/30"
            onClick={disconnectWeb}
          >
            <LogOut className="w-4 h-4" /> Desconectar Sessão
          </Button>
        </div>
      )}
    </div>
  )
}
