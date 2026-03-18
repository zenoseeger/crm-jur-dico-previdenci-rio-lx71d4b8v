import React, { useState } from 'react'
import { CardContent } from '@/components/ui/card'
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
import { Loader2, Save, LogOut, QrCode, Copy, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface ConnectionTabProps {
  config: any
  setConfig: (config: any) => void
  onSave: () => void
  saving: boolean
  onConnect: () => void
  onDisconnect: () => void
}

const DEFAULT_INSTANCE_ID = '3F04FD79EF154102370DEE37F1774CBC'
const DEFAULT_TOKEN = '194683CEB3DC29A1249EC368'

export function WhatsAppConnectionTab({
  config,
  setConfig,
  onSave,
  saving,
  onConnect,
  onDisconnect,
}: ConnectionTabProps) {
  const [showClientToken, setShowClientToken] = useState(false)

  const handleProviderChange = (v: 'none' | 'z-api') => {
    setConfig({
      ...config,
      provider: v,
      instance_id: config.instance_id || (v === 'z-api' ? DEFAULT_INSTANCE_ID : ''),
      token: config.token || (v === 'z-api' ? DEFAULT_TOKEN : ''),
    })
  }

  const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bnuripqdjxiympxhlthy.supabase.co'
  const webhookUrl = `${baseUrl}/functions/v1/zapi-webhook`

  return (
    <CardContent className="space-y-6 pt-6">
      <div className="space-y-2">
        <Label className="text-base font-semibold">Provedor de Conexão</Label>
        <Select value={config.provider} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Selecione o provedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum (Desconectado)</SelectItem>
            <SelectItem value="z-api">Z-API</SelectItem>
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
              <Label>Token da Instância (Instance Token)</Label>
              <Input
                type="password"
                placeholder="Ex: 194683CEB3DC29A1249EC368"
                value={config.token || ''}
                onChange={(e) => setConfig({ ...config, token: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Utilizado apenas na URL das requisições da Z-API.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Client Token</Label>
              <div className="relative">
                <Input
                  type={showClientToken ? 'text' : 'password'}
                  placeholder="Seu Client Token de segurança"
                  value={config.client_token || ''}
                  onChange={(e) => setConfig({ ...config, client_token: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowClientToken(!showClientToken)}
                >
                  {showClientToken ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Utilizado como Header "client-token" (obrigatório para webhook e autenticação).
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {config.status === 'connected' ? (
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                onClick={onDisconnect}
              >
                <LogOut className="w-4 h-4 mr-2" /> Desconectar Instância
              </Button>
            ) : (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                onClick={onConnect}
                disabled={!config.instance_id || !config.token || !config.client_token}
              >
                <QrCode className="w-4 h-4 mr-2" /> Gerar QR Code e Conectar
              </Button>
            )}
          </div>

          <div className="space-y-2 bg-muted/30 p-4 rounded-xl border">
            <h4 className="text-sm font-semibold">Configuração de Webhook (Z-API Panel)</h4>
            <p className="text-xs text-muted-foreground mb-2">
              O Webhook será configurado automaticamente através da aba Diagnósticos, ou você pode
              copiar a URL abaixo e colar no painel da Z-API.
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
        <Button onClick={onSave} disabled={saving} className="bg-slate-900 text-white gap-2 px-6">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Configurações
        </Button>
      </div>
    </CardContent>
  )
}
