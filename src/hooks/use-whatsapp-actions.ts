import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { logWhatsAppEvent } from '@/lib/whatsapp-logger'
import { toast } from 'sonner'

export function useWhatsAppActions(config: any, setConfig: any, user: any) {
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const [requiresReset, setRequiresReset] = useState(false)

  const updateDbStatus = async (status: string, lastError: string | null = null) => {
    if (!config.id) return
    await supabase
      .from('whatsapp_configs')
      .update({ status, last_error: lastError })
      .eq('id', config.id)
    setConfig((prev: any) => ({ ...prev, status, last_error: lastError }))
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
    setRequiresReset(false)

    try {
      const statusRes = await fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/status`,
      )
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        if (statusData.connected) {
          await updateDbStatus('connected', null)
          await logWhatsAppEvent(user.id, 'CONNECT_SUCCESS', 'Instância já estava conectada.')
          setQrModalOpen(false)
          toast.info('A instância já está conectada.')
          setQrLoading(false)
          return
        }
      }

      const res = await fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/qr-code/image`,
      )

      if (res.ok) {
        const data = await res.json()
        if (data.value) {
          setQrImage(data.value)
          await logWhatsAppEvent(user.id, 'QR_GENERATED', 'QR Code gerado com sucesso.')
        } else {
          setQrError('A API não retornou a imagem do QR Code.')
        }
      } else if (res.status === 400) {
        setQrError(
          'A instância retornou um erro 400. Ela pode estar travada em um processo anterior ou precisando de reinicialização manual.',
        )
        setRequiresReset(true)
        await updateDbStatus('error', 'Erro 400 ao gerar QR Code')
        await logWhatsAppEvent(
          user.id,
          'ERROR',
          'Erro 400 ao gerar QR Code. Possível travamento.',
          { status: 400 },
        )
      } else {
        setQrError(`Erro ao buscar QR Code: HTTP ${res.status}`)
        await updateDbStatus('error', `Erro HTTP ${res.status}`)
        await logWhatsAppEvent(user.id, 'ERROR', `Erro HTTP ${res.status} ao gerar QR Code`)
      }
    } catch (error: any) {
      setQrError('Erro de rede ao comunicar com Z-api.')
      await updateDbStatus('error', 'Erro de rede')
      await logWhatsAppEvent(user.id, 'ERROR', 'Erro de rede ao buscar QR', {
        error: error.message,
      })
    } finally {
      setQrLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!config.instance_id || !config.token) return
    try {
      await fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/disconnect-account`,
        { method: 'POST' },
      )
      await updateDbStatus('disconnected', null)
      await logWhatsAppEvent(user.id, 'DISCONNECT', 'Instância desconectada pelo usuário.')
      toast.success('Instância desconectada com sucesso!')
    } catch (error: any) {
      toast.error('Erro de rede ao desconectar instância.')
      await logWhatsAppEvent(user.id, 'ERROR', 'Erro ao desconectar', { error: error.message })
    }
  }

  const handleReset = async () => {
    if (!config.instance_id || !config.token) return
    try {
      await fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/disconnect-account`,
        { method: 'POST' },
      )
      await fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/disconnect`,
      )
      await updateDbStatus('disconnected', null)
      await logWhatsAppEvent(user.id, 'RESET', 'Reinicialização forçada da instância.')
      toast.success('Instância reiniciada. Tente conectar novamente.')
      setRequiresReset(false)
      setQrModalOpen(false)
    } catch (error: any) {
      toast.error('Erro ao reiniciar instância.')
      await logWhatsAppEvent(user.id, 'ERROR', 'Erro ao forçar reset', { error: error.message })
    }
  }

  const handleTestWebhook = async () => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bnuripqdjxiympxhlthy.supabase.co'
    const webhookUrl = `${baseUrl}/functions/v1/zapi-webhook`

    try {
      const res = await fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/update-webhook-delivery`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: webhookUrl }),
        },
      )
      if (res.ok) {
        const now = new Date().toISOString()
        await supabase
          .from('whatsapp_configs')
          .update({ webhook_verified_at: now })
          .eq('id', config.id)
        setConfig((p: any) => ({ ...p, webhook_verified_at: now }))
        await logWhatsAppEvent(
          user.id,
          'WEBHOOK_VERIFIED',
          'Webhook testado e configurado com sucesso na Z-api.',
        )
        toast.success('Webhook verificado e configurado com sucesso!')
      } else {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch (error: any) {
      toast.error('Falha ao testar webhook.')
      await logWhatsAppEvent(user.id, 'ERROR', 'Falha ao testar Webhook', { error: error.message })
    }
  }

  return {
    qrModalOpen,
    setQrModalOpen,
    qrLoading,
    qrImage,
    qrError,
    requiresReset,
    handleConnect,
    handleDisconnect,
    handleReset,
    handleTestWebhook,
    updateDbStatus,
  }
}
