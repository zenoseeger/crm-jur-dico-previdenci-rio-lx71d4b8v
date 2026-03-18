import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { DbWhatsAppConfig } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copy, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export function WhatsAppConfig() {
  const { user } = useAuth()
  const [config, setConfig] = useState<Partial<DbWhatsAppConfig>>({ provider: 'none' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('whatsapp_configs')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) setConfig(data)
      setLoading(false)
    }
    fetchConfig()
  }, [user])

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

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zapi-webhook`

  if (loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl">
      <CardHeader>
        <CardTitle>Integração Z-api</CardTitle>
        <CardDescription>
          Configure o provedor para habilitar o envio e recebimento de mensagens, além do uso de IA
          pelo WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Provedor de Conexão</Label>
          <Select
            value={config.provider}
            onValueChange={(v: any) => setConfig({ ...config, provider: v })}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Selecione o provedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Desconectado</SelectItem>
              <SelectItem value="z-api">Z-api</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.provider === 'z-api' && (
          <div className="space-y-5 animate-fade-in border-t border-border pt-5">
            <div className="space-y-2">
              <Label>Instance ID</Label>
              <Input
                placeholder="Ex: 3B7...9E2"
                value={config.instance_id || ''}
                onChange={(e) => setConfig({ ...config, instance_id: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Token</Label>
                <Input
                  type="password"
                  placeholder="Seu Token Z-api"
                  value={config.token || ''}
                  onChange={(e) => setConfig({ ...config, token: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Client Token</Label>
                <Input
                  type="password"
                  placeholder="Seu Client Token de Segurança"
                  value={config.client_token || ''}
                  onChange={(e) => setConfig({ ...config, client_token: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 bg-muted/30 p-4 rounded-xl border">
              <h4 className="text-sm font-semibold">Configuração de Webhook (Z-api Panel)</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Copie a URL abaixo e cole no painel do Z-api em "Webhooks" (Eventos de Mensagem
                Recebida).
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
  )
}
