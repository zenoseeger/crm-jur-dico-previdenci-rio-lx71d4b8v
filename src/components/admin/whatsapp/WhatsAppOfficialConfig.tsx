import React, { useState } from 'react'
import { useAdminStore } from '@/stores/useAdminStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Save, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export function WhatsAppOfficialConfig() {
  const { whatsAppConfig, updateWhatsAppConfig } = useAdminStore()
  const [formData, setFormData] = useState({
    token: whatsAppConfig.token,
    phoneId: whatsAppConfig.phoneId,
    accountId: whatsAppConfig.accountId,
    webhookUrl: whatsAppConfig.webhookUrl,
  })

  const handleSave = () => {
    updateWhatsAppConfig(formData)
    toast.success('Credenciais oficiais salvas com sucesso!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.webhookUrl || 'https://api.previcrm.com/webhook/wa')
    toast.success('Webhook URL copiada para a área de transferência.')
  }

  return (
    <div className="grid gap-5 animate-fade-in">
      <div className="space-y-2">
        <Label>Token de Acesso (Permanente)</Label>
        <Input
          type="password"
          placeholder="EAA..."
          value={formData.token}
          onChange={(e) => setFormData({ ...formData, token: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Phone Number ID</Label>
          <Input
            placeholder="Ex: 1045982..."
            value={formData.phoneId}
            onChange={(e) => setFormData({ ...formData, phoneId: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp Business Account ID</Label>
          <Input
            placeholder="Ex: 110948..."
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2 bg-muted/30 p-4 rounded-xl border">
        <h4 className="text-sm font-semibold">Configuração de Webhook</h4>
        <p className="text-xs text-muted-foreground mb-2">
          Configure esta URL no painel de desenvolvedores da Meta para receber notificações de
          mensagens.
        </p>
        <div className="flex gap-2">
          <Input
            readOnly
            value={formData.webhookUrl || 'https://api.previcrm.com/webhook/wa'}
            className="bg-background font-mono text-xs text-primary/80"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            title="Copiar URL"
            className="shrink-0 bg-background"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <Button
          variant="link"
          className="text-muted-foreground gap-1 px-0 hover:text-primary"
          asChild
        >
          <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer">
            Acessar Meta for Developers <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
        <Button onClick={handleSave} className="bg-slate-900 text-white gap-2 px-6">
          <Save className="w-4 h-4" /> Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
