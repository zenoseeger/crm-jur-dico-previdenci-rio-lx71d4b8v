import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { DbWhatsAppConfig } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Copy, Loader2, Save, CheckCircle2, XCircle, QrCode, LogOut } from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_INSTANCE_ID = '3F04FD79EF154102370DEE37F1774CBC'
const DEFAULT_TOKEN = '194683CEB3DC29A1249EC368'

export function WhatsAppConfig() {
  const { user } = useAuth()
  const [config, setConfig] = useState<Partial<DbWhatsAppConfig>>({ provider: 'none' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'checking'
  >('checking')
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('whatsapp_configs')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setConfig(data)
      } else {
        setConfig({
          provider: 'none',
          instance_id: DEFAULT_INSTANCE_ID,
          token: DEFAULT_TOKEN,
          client_token: '',
        })
      }
      setLoading(false)
    }
    fetchConfig()
  }, [user])

  const checkStatus = useCallback(async () => {
    if (config.provider !== 'z-api' || !config.instance_id || !config.token) {
      setConnectionStatus('disconnected')
      return
    }

    try {
      const res = await fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/status`,
      )
      if (res.ok) {
        const data = await res.json()
        if (data.connected) {
          setConnectionStatus('connected')
        } else {
          setConnectionStatus('disconnected')
        }
      } else {
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('Falha ao verificar status do Z-api', error)
    }
  }, [config.provider, config.instance_id, config.token])

  useEffect(() => {
    if (!loading && config.provider === 'z-api' && config.instance_id && config.token) {
      checkStatus()
      const interval = setInterval(checkStatus, qrModalOpen ? 3000 : 15000)
      return () => clearInterval(interval)
    } else if (!loading) {
      setConnectionStatus('disconnected')
    }
  }, [checkStatus, loading, config.provider, config.instance_id, config.token, qrModalOpen])

  useEffect(() => {
    if (connectionStatus === 'connected' && qrModalOpen) {
      setQrModalOpen(false)
      toast.success('WhatsApp conectado com sucesso!')
    }
  }, [connectionStatus, qrModalOpen])

  const handleProviderChange = (v: 'none' | 'z-api') => {
    setConfig((prev) => ({
      ...prev,
      provider: v,
      instance_id: prev.instance_id || (v === 'z-api' ? DEFAULT_INSTANCE_ID : ''),
      token: prev.token || (v === 'z-api' ? DEFAULT_TOKEN : ''),
    }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    const payload: any = {
      user_id: user.id,
      provider: config.provider,
      instance_id: config.instance_id,
      token: config.token,
      client_token: config.client_token,
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
    }
    setSaving(false)
  }

  const handleConnect = async () => {
    if (!config.instance_id || !config.token) {
      toast.error('Informe o ID e o Token da instância primeiro.')
      return
    }

    setQrModalOpen(true)
    setQrLoading(true)
    setQrError(null)
    setQrImage(null)

    try {
      const res = await fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/qr-code/image`,
      )
      if (res.ok) {
        const data = await res.json()
        if (data.value) {
          setQrImage(data.value)
        } else {
          setQrError('A API não retornou a imagem do QR Code.')
        }
      } else {
        setQrError(`Erro ao buscar QR Code: HTTP ${res.status}`)
      }
    } catch (error: any) {
      setQrError('Erro de rede ao comunicar com Z-api.')
    } finally {
      setQrLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!config.instance_id || !config.token) return

    try {
      const res = await fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/disconnect`,
      )
      if (res.ok) {
        toast.success('Instância desconectada com sucesso!')
        setConnectionStatus('disconnected')
      } else {
        toast.error('Erro ao desconectar instância na Z-api.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro de rede ao desconectar instância.')
    }
  }

  const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bnuripqdjxiympxhlthy.supabase.co'
  const webhookUrl = `${baseUrl}/functions/v1/zapi-webhook`

  if (loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </Card>
    )
  }

  return (
    <>
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-1">
            <CardTitle>Integração Z-api</CardTitle>
            {config.provider === 'z-api' && (
              <Badge
                variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
                className={
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500 hover:bg-emerald-600 gap-1.5'
                    : 'gap-1.5 text-muted-foreground'
                }
              >
                {connectionStatus === 'checking' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando...
                  </>
                ) : connectionStatus === 'connected' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
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
            Configure o provedor para habilitar o envio e recebimento de mensagens, além do uso de
            IA pelo WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Provedor de Conexão</Label>
            <Select
              value={config.provider}
              onValueChange={(v: 'none' | 'z-api') => handleProviderChange(v)}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (Desconectado)</SelectItem>
                <SelectItem value="z-api">Z-api</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.provider === 'z-api' && (
            <div className="space-y-5 animate-fade-in border-t border-border pt-5">
              <div className="space-y-2">
                <Label>ID da instância (Instance ID)</Label>
                <Input
                  placeholder="Ex: 3F04FD79EF154102370DEE37F1774CBC"
                  value={config.instance_id || ''}
                  onChange={(e) => setConfig({ ...config, instance_id: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Token da instância</Label>
                  <Input
                    type="password"
                    placeholder="Ex: 194683CEB3DC29A1249EC368"
                    value={config.token || ''}
                    onChange={(e) => setConfig({ ...config, token: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Token (Segurança)</Label>
                  <Input
                    type="password"
                    placeholder="Seu Client Token (opcional/recomendado)"
                    value={config.client_token || ''}
                    onChange={(e) => setConfig({ ...config, client_token: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {connectionStatus === 'connected' ? (
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                    onClick={handleDisconnect}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Desconectar WhatsApp
                  </Button>
                ) : (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                    onClick={handleConnect}
                    disabled={!config.instance_id || !config.token}
                  >
                    <QrCode className="w-4 h-4 mr-2" /> Conectar WhatsApp
                  </Button>
                )}
              </div>

              <div className="space-y-2 bg-muted/30 p-4 rounded-xl border">
                <h4 className="text-sm font-semibold">Configuração de Webhook (Z-api Panel)</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Copie a URL abaixo e cole no painel do Z-api em "Webhooks" (Eventos de Mensagem
                  Recebida) para que o CRM receba as respostas dos leads.
                </p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={webhookUrl}
                    className="bg-background font-mono text-xs text-primary/80 flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl)
                      toast.success('Webhook URL copiada!')
                    }}
                    title="Copiar URL"
                    className="shrink-0 bg-background"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-slate-900 text-white gap-2 px-6"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code abaixo com o seu WhatsApp para conectar a instância Z-api.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
            {qrLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
              </div>
            ) : qrError ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-destructive">{qrError}</p>
                <Button variant="outline" onClick={handleConnect}>
                  Tentar Novamente
                </Button>
              </div>
            ) : qrImage ? (
              <div className="space-y-6 flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <img src={qrImage} alt="QR Code" className="w-64 h-64 object-contain" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Aguardando leitura...
                </p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
