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
import { Copy, Save, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export function WhatsAppConfig() {
  const { whatsAppConfig, updateWhatsAppConfig } = useAdminStore()
  const [formData, setFormData] = useState(whatsAppConfig)

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.webhookUrl)
    toast.success('Webhook URL copiada para a área de transferência.')
  }

  const handleSave = () => {
    updateWhatsAppConfig(formData)
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Integração WhatsApp Business API</CardTitle>
            <CardDescription>
              Configure as credenciais do Meta Cloud API para disparo de mensagens.
            </CardDescription>
          </div>
          <Badge
            variant={formData.connected ? 'default' : 'destructive'}
            className={formData.connected ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {formData.connected ? 'Conectado' : 'Desconectado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
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
        </div>

        <div className="pt-4 border-t space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Configuração de Webhook</h4>
            <p className="text-xs text-muted-foreground">
              Cole esta URL no painel de desenvolvedores do Meta para receber mensagens.
            </p>
          </div>
          <div className="flex gap-2">
            <Input readOnly value={formData.webhookUrl} className="bg-muted font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={handleCopy} title="Copiar URL">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
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
    </Card>
  )
}
