import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, RefreshCw } from 'lucide-react'
import { WhatsAppLogs } from './WhatsAppLogs'

interface DiagnosticsTabProps {
  config: any
  onTestWebhook: () => void
  onReset: () => void
}

export function WhatsAppDiagnosticsTab({ config, onTestWebhook, onReset }: DiagnosticsTabProps) {
  return (
    <div className="space-y-6 pt-6 animate-fade-in px-6 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Health Check do Webhook</CardTitle>
            <CardDescription className="text-xs">
              Verifica e atualiza a URL de recebimento de mensagens na Z-api.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Última verificação bem sucedida:
              </p>
              <p className="text-xs text-muted-foreground">
                {config.webhook_verified_at
                  ? new Date(config.webhook_verified_at).toLocaleString('pt-BR')
                  : 'Nenhuma verificação realizada'}
              </p>
            </div>
            <Button
              onClick={onTestWebhook}
              variant="secondary"
              className="w-full"
              disabled={!config.instance_id}
            >
              <Activity className="w-4 h-4 mr-2" /> Testar Comunicação
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive">Controle de Instância</CardTitle>
            <CardDescription className="text-xs">
              Força a desconexão e limpa a sessão na API em caso de travamentos severos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Se a instância estiver retornando "Erro 400" constantemente, utilize este recurso para
              reiniciar o estado.
            </p>
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
              disabled={!config.instance_id}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Forçar Reinicialização
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Logs de Conexão e Erros</CardTitle>
          <CardDescription className="text-xs">
            Histórico das últimas interações técnicas do sistema com o provedor.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 border-t border-border/50">
          {config.user_id && <WhatsAppLogs userId={config.user_id} />}
        </CardContent>
      </Card>
    </div>
  )
}
