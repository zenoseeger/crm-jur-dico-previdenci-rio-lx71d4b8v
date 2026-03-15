import React, { useState } from 'react'
import { useAdminStore } from '@/stores/useAdminStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Copy,
  Save,
  ExternalLink,
  QrCode,
  Smartphone,
  LogOut,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { WhatsAppConnectionType } from '@/types'

export function WhatsAppConfig() {
  const { whatsAppConfig, updateWhatsAppConfig } = useAdminStore()
  const [formData, setFormData] = useState(whatsAppConfig)

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.webhookUrl)
    toast.success('Webhook URL copiada para a área de transferência.')
  }

  const handleSave = () => {
    updateWhatsAppConfig(formData)
    toast.success('Configurações salvas com sucesso!')
  }

  const handleTypeChange = (val: WhatsAppConnectionType) => {
    if (val === 'official' && formData.webSessionStatus === 'connected') {
      if (
        !window.confirm('Mudar para a API Oficial irá desconectar sua sessão Web atual. Continuar?')
      )
        return
      const updates = { connectionType: val, webSessionStatus: 'disconnected' as const }
      setFormData({ ...formData, ...updates })
      updateWhatsAppConfig(updates)
    } else {
      setFormData({ ...formData, connectionType: val })
    }
  }

  const generateQR = () => {
    setFormData((p) => ({ ...p, webSessionStatus: 'authenticating' }))
    setTimeout(() => {
      setFormData((p) => ({ ...p, webSessionStatus: 'awaiting_scan' }))
    }, 1500)
  }

  const simulateScan = () => {
    const updates = {
      webSessionStatus: 'connected' as const,
      webProfileName: 'Atendimento CRM',
      webProfilePhone: '+55 11 99999-9999',
    }
    setFormData((p) => ({ ...p, ...updates }))
    updateWhatsAppConfig(updates)
    toast.success('WhatsApp Web conectado com sucesso!')
  }

  const disconnectWeb = () => {
    const updates = { webSessionStatus: 'disconnected' as const }
    setFormData((p) => ({ ...p, ...updates }))
    updateWhatsAppConfig(updates)
    toast.success('Sessão desconectada.')
  }

  const renderBadge = () => {
    if (formData.connectionType === 'official') {
      return (
        <Badge
          variant={formData.connected ? 'default' : 'destructive'}
          className={formData.connected ? 'bg-green-500' : ''}
        >
          {formData.connected ? 'Conectado (Oficial)' : 'Desconectado'}
        </Badge>
      )
    }
    switch (formData.webSessionStatus) {
      case 'connected':
        return <Badge className="bg-green-500">Conectado (Web)</Badge>
      case 'awaiting_scan':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-amber-950">Aguardando QR</Badge>
        )
      case 'authenticating':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Gerando Sessão...</Badge>
      default:
        return <Badge variant="destructive">Desconectado</Badge>
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
            value={formData.connectionType}
            onValueChange={handleTypeChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div
              className={`border p-4 rounded-lg cursor-pointer transition-colors ${formData.connectionType === 'official' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
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
              className={`border p-4 rounded-lg cursor-pointer transition-colors ${formData.connectionType === 'web' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
              onClick={() => handleTypeChange('web')}
            >
              <div className="flex items-center gap-2 mb-2">
                <RadioGroupItem value="web" id="web" />
                <Label htmlFor="web" className="font-semibold cursor-pointer">
                  Web API (QR Code)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Conexão rápida vinculada a um aparelho físico via escaneamento.
              </p>
            </div>
          </RadioGroup>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          {formData.connectionType === 'official' ? (
            <div className="grid gap-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Token de Acesso (Permanente)</Label>
                <Input
                  type="password"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number ID</Label>
                  <Input
                    value={formData.phoneId}
                    onChange={(e) => setFormData({ ...formData, phoneId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Business Account ID</Label>
                  <Input
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-3 mt-2">
                <h4 className="text-sm font-semibold">Configuração de Webhook</h4>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={formData.webhookUrl}
                    className="bg-muted font-mono text-xs"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopy} title="Copiar URL">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/20 animate-fade-in text-center min-h-[280px]">
              {formData.webSessionStatus === 'disconnected' && (
                <div className="space-y-4">
                  <Smartphone className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold">Nenhuma sessão ativa</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                      Gere um QR Code para conectar seu número de WhatsApp ao sistema.
                    </p>
                  </div>
                  <Button onClick={generateQR} className="bg-slate-900 gap-2 mt-2">
                    <QrCode className="w-4 h-4" /> Gerar QR Code
                  </Button>
                </div>
              )}
              {formData.webSessionStatus === 'authenticating' && (
                <div className="space-y-4 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                  <p className="text-sm font-medium">Iniciando sessão e gerando código...</p>
                </div>
              )}
              {formData.webSessionStatus === 'awaiting_scan' && (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="p-4 bg-white rounded-xl shadow-sm border">
                    <img
                      src="https://img.usecurling.com/p/200/200?q=qr%20code&color=black"
                      alt="QR Code"
                      className="w-48 h-48 object-cover opacity-80"
                    />
                  </div>
                  <p className="text-sm font-medium">
                    Abra o WhatsApp no celular e escaneie o código.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={generateQR}>
                      <RefreshCw className="w-3 h-3 mr-2" /> Recarregar
                    </Button>
                    <Button
                      size="sm"
                      onClick={simulateScan}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Simular Leitura (Teste)
                    </Button>
                  </div>
                </div>
              )}
              {formData.webSessionStatus === 'connected' && (
                <div className="space-y-6 w-full max-w-sm">
                  <div className="flex items-center gap-4 p-4 border rounded-lg bg-background shadow-sm">
                    <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold">{formData.webProfileName}</p>
                      <p className="text-sm text-muted-foreground">{formData.webProfilePhone}</p>
                    </div>
                  </div>
                  <Button variant="destructive" className="w-full gap-2" onClick={disconnectWeb}>
                    <LogOut className="w-4 h-4" /> Desconectar Sessão
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      {formData.connectionType === 'official' && (
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center py-4">
          <Button variant="link" className="text-muted-foreground gap-1" asChild>
            <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer">
              Meta Portal <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
          <Button onClick={handleSave} className="bg-slate-900 gap-2">
            <Save className="w-4 h-4" /> Salvar Credenciais
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
