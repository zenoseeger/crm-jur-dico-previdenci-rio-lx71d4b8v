import React from 'react'
import { useAdminStore } from '@/stores/useAdminStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { WhatsAppConnectionType } from '@/types'
import { WhatsAppWebConfig } from './whatsapp/WhatsAppWebConfig'
import { WhatsAppOfficialConfig } from './whatsapp/WhatsAppOfficialConfig'

export function WhatsAppConfig() {
  const { whatsAppConfig, updateWhatsAppConfig } = useAdminStore()

  const handleTypeChange = (val: WhatsAppConnectionType) => {
    if (val === 'official' && whatsAppConfig.webSessionStatus === 'connected') {
      if (
        !window.confirm('Mudar para a API Oficial irá desconectar sua sessão Web atual. Continuar?')
      ) {
        return
      }
      updateWhatsAppConfig({ connectionType: val, webSessionStatus: 'disconnected' })
    } else {
      updateWhatsAppConfig({ connectionType: val })
    }
  }

  const renderBadge = () => {
    if (whatsAppConfig.connectionType === 'official') {
      return (
        <Badge
          variant={whatsAppConfig.connected ? 'default' : 'destructive'}
          className={whatsAppConfig.connected ? 'bg-[#25D366] hover:bg-[#1DA851]' : ''}
        >
          {whatsAppConfig.connected ? 'Conectado (Oficial)' : 'Desconectado'}
        </Badge>
      )
    }
    switch (whatsAppConfig.webSessionStatus) {
      case 'connected':
        return <Badge className="bg-[#25D366] hover:bg-[#1DA851]">Conectado (Web)</Badge>
      case 'awaiting_scan':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Aguardando QR</Badge>
      case 'authenticating':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Gerando Sessão...</Badge>
      case 'error':
        return <Badge variant="destructive">Erro de Conexão</Badge>
      default:
        return <Badge variant="secondary">Desconectado</Badge>
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Integração WhatsApp</CardTitle>
            <CardDescription>
              Configure o método de conexão para envio e recebimento de mensagens.
            </CardDescription>
          </div>
          {renderBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Método de Conexão</Label>
          <RadioGroup
            value={whatsAppConfig.connectionType}
            onValueChange={handleTypeChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div
              className={`border p-4 rounded-xl cursor-pointer transition-all ${whatsAppConfig.connectionType === 'official' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/50 border-border'}`}
              onClick={() => handleTypeChange('official')}
            >
              <div className="flex items-center gap-2 mb-2">
                <RadioGroupItem value="official" id="official" />
                <Label htmlFor="official" className="font-semibold cursor-pointer">
                  API Oficial (Meta)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Recomendado para estabilidade. Requer aprovação do Meta Business.
              </p>
            </div>
            <div
              className={`border p-4 rounded-xl cursor-pointer transition-all ${whatsAppConfig.connectionType === 'web' ? 'border-[#25D366] bg-[#25D366]/5 ring-1 ring-[#25D366]/20' : 'hover:bg-muted/50 border-border'}`}
              onClick={() => handleTypeChange('web')}
            >
              <div className="flex items-center gap-2 mb-2">
                <RadioGroupItem
                  value="web"
                  id="web"
                  className={
                    whatsAppConfig.connectionType === 'web' ? 'border-[#25D366] text-[#25D366]' : ''
                  }
                />
                <Label htmlFor="web" className="font-semibold cursor-pointer">
                  Web API (QR Code)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Conexão rápida vinculada a um aparelho físico via escaneamento do WhatsApp.
              </p>
            </div>
          </RadioGroup>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          {whatsAppConfig.connectionType === 'official' ? (
            <WhatsAppOfficialConfig />
          ) : (
            <WhatsAppWebConfig />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
