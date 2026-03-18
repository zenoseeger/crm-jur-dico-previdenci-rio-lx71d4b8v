import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { logWhatsAppEvent } from '@/lib/whatsapp-logger'
import { useWhatsAppActions } from '@/hooks/use-whatsapp-actions'

import { WhatsAppConnectionTab } from './whatsapp/WhatsAppConnectionTab'
import { WhatsAppDiagnosticsTab } from './whatsapp/WhatsAppDiagnosticsTab'
import { WhatsAppQRDialog } from './whatsapp/WhatsAppQRDialog'

export function WhatsAppConfig() {
  const { user } = useAuth()
  const [config, setConfig] = useState<any>({ provider: 'none', status: 'disconnected' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const actions = useWhatsAppActions(config, setConfig, user)

  useEffect(() => {
    if (!user) return
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('whatsapp_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching WhatsApp config:', error)
      } else if (data) {
        setConfig(data)
      }
      setLoading(false)
    }
    fetchConfig()
  }, [user])

  const checkStatus = useCallback(async () => {
    if (config.provider !== 'z-api' || !config.instance_id || !config.token) return
    try {
      const headers: any = {}
      if (config.client_token) {
        headers['client-token'] = config.client_token
      }

      const res = await fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/status`,
        { headers },
      )
      if (res.ok) {
        const data = await res.json()
        const newStatus = data.connected ? 'connected' : 'disconnected'
        if (newStatus !== config.status) {
          actions.updateDbStatus(newStatus, null)
          if (newStatus === 'connected') {
            await logWhatsAppEvent(
              user!.id,
              'STATUS_CHANGE',
              'WhatsApp conectado e reconhecido via polling.',
            )
          }
        }
      }
    } catch (error) {
      // Ignorar erros de polling de rede
    }
  }, [config, actions, user])

  useEffect(() => {
    if (!loading && config.provider === 'z-api') {
      checkStatus()
      const interval = setInterval(checkStatus, actions.qrModalOpen ? 4000 : 20000)
      return () => clearInterval(interval)
    }
  }, [checkStatus, loading, config.provider, actions.qrModalOpen])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const payload: any = {
      user_id: user.id,
      provider: config.provider,
      instance_id: config.instance_id,
      token: config.token,
      client_token: config.client_token,
      status: config.status || 'disconnected',
    }
    if (config.id) payload.id = config.id

    const { data, error } = await supabase
      .from('whatsapp_configs')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao salvar as configurações.')
    } else {
      toast.success('Configurações salvas com sucesso!')
      if (data) setConfig(data)
      await logWhatsAppEvent(user.id, 'CONFIG_UPDATED', 'Configurações de integração atualizadas.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </Card>
    )
  }

  return (
    <>
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl">
        <CardHeader className="border-b border-border/50 pb-4 mb-2">
          <div className="flex items-center justify-between mb-1">
            <CardTitle>Integração Z-api</CardTitle>
            {config.provider === 'z-api' && (
              <Badge
                variant="outline"
                className={
                  config.status === 'connected'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 gap-1.5'
                    : config.status === 'error'
                      ? 'bg-destructive/10 border-destructive/20 text-destructive gap-1.5'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-muted-foreground gap-1.5'
                }
              >
                {config.status === 'connected' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
                  </>
                ) : config.status === 'error' ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" /> Erro
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Desconectado
                  </>
                )}
              </Badge>
            )}
          </div>
          <CardDescription>
            Gerencie o provedor de disparo e acompanhe a saúde da conexão.
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="connection" className="w-full">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="connection">Configuração</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnósticos & Logs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="connection" className="m-0 focus-visible:outline-none">
            <WhatsAppConnectionTab
              config={config}
              setConfig={setConfig}
              onSave={handleSave}
              saving={saving}
              onConnect={actions.handleConnect}
              onDisconnect={actions.handleDisconnect}
            />
          </TabsContent>

          <TabsContent
            value="diagnostics"
            className="m-0 focus-visible:outline-none bg-slate-50 dark:bg-slate-900/20 rounded-b-lg"
          >
            <WhatsAppDiagnosticsTab
              config={config}
              onTestWebhook={actions.handleTestWebhook}
              onReset={actions.handleReset}
              isTestingWebhook={actions.isTestingWebhook}
            />
          </TabsContent>
        </Tabs>
      </Card>

      <WhatsAppQRDialog
        open={actions.qrModalOpen}
        onOpenChange={actions.setQrModalOpen}
        loading={actions.qrLoading}
        error={actions.qrError}
        image={actions.qrImage}
        requiresReset={actions.requiresReset}
        onConnectRetry={actions.handleConnect}
        onReset={actions.handleReset}
      />
    </>
  )
}
