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
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)

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
          const errMsg = 'A API não retornou a imagem do QR Code.'
          setQrError(errMsg)
          await updateDbStatus('error', errMsg)
          await logWhatsAppEvent(user.id, 'connection_error', errMsg, { response: data })
        }
      } else {
        let errorBody = {}
        try {
          errorBody = await res.json()
        } catch (e) {
          // ignore parsing error
        }

        const errorMessage =
          (errorBody as any).error || (errorBody as any).message || `Erro HTTP ${res.status}`

        setQrError(errorMessage)
        setRequiresReset(res.status >= 400 && res.status < 500)
        await updateDbStatus('error', errorMessage)
        await logWhatsAppEvent(
          user.id,
          'connection_error',
          `Falha ao gerar QR Code: ${errorMessage}`,
          {
            status: res.status,
            body: errorBody,
          },
        )
      }
    } catch (error: any) {
      const errMsg = error.message || 'Erro de rede ao comunicar com Z-api.'
      setQrError(errMsg)
      await updateDbStatus('error', errMsg)
      await logWhatsAppEvent(user.id, 'connection_error', `Falha de conexão: ${errMsg}`, {
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
      await logWhatsAppEvent(user.id, 'connection_error', 'Erro ao forçar reset', {
        error: error.message,
      })
    }
  }

  const handleTestWebhook = async () => {
    if (!config.instance_id || !config.token) {
      toast.error('Configuração incompleta: Instance ID ou Token ausente.')
      return
    }

    setIsTestingWebhook(true)
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bnuripqdjxiympxhlthy.supabase.co'
    const webhookUrl = `${baseUrl}/functions/v1/zapi-webhook`

    try {
      const statusRes = await fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/status`,
      )

      let statusData: any = {}
      try {
        statusData = await statusRes.json()
      } catch (e) {
        // ignore parsing error
      }

      if (!statusRes.ok) {
        let errMsg = 'Erro desconhecido na Z-api.'
        if (statusRes.status === 401 || statusRes.status === 403) {
          errMsg = 'Falha na Autenticação: Verifique o Token da Z-api.'
        } else if (statusRes.status === 404) {
          errMsg = 'Instância não encontrada: Verifique o Instance ID.'
        } else if (statusRes.status === 400) {
          errMsg = statusData.error || statusData.message || 'Erro na requisição (400).'
        } else {
          errMsg = statusData.error || `HTTP Erro ${statusRes.status}`
        }

        toast.error(errMsg)
        await updateDbStatus('error', errMsg)
        await logWhatsAppEvent(
          user.id,
          'webhook_health_check',
          `Falha de conectividade: ${errMsg}`,
          { status: statusRes.status, body: statusData },
        )
        setIsTestingWebhook(false)
        return
      }

      let currentWebhook = ''
      try {
        const getWebhookRes = await fetch(
          `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/webhook-delivery`,
        )
        if (getWebhookRes.ok) {
          const whData = await getWebhookRes.json()
          currentWebhook = whData.value
        }
      } catch (e) {
        // ignore fetch error
      }

      let webhookData: any = { status: 'already_matched' }
      let webhookConfigured = false

      if (currentWebhook !== webhookUrl) {
        const webhookRes = await fetch(
          `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/update-webhook-delivery`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: webhookUrl }),
          },
        )

        try {
          webhookData = await webhookRes.json()
        } catch (e) {
          // ignore parsing error
        }

        if (!webhookRes.ok) {
          const errMsg =
            webhookData.error ||
            webhookData.message ||
            `Erro HTTP ${webhookRes.status} ao configurar webhook.`
          toast.error(`Falha ao configurar webhook: ${errMsg}`)
          await updateDbStatus('error', `Falha no Webhook: ${errMsg}`)
          await logWhatsAppEvent(
            user.id,
            'webhook_health_check',
            `Falha de configuração de webhook: ${errMsg}`,
            { status: webhookRes.status, body: webhookData },
          )
          setIsTestingWebhook(false)
          return
        }
        webhookConfigured = true
      }

      const now = new Date().toISOString()
      await supabase
        .from('whatsapp_configs')
        .update({ webhook_verified_at: now, status: 'connected', last_error: null })
        .eq('id', config.id)

      setConfig((p: any) => ({
        ...p,
        webhook_verified_at: now,
        status: 'connected',
        last_error: null,
      }))

      await logWhatsAppEvent(
        user.id,
        'webhook_health_check',
        webhookConfigured
          ? 'Webhook verificado e atualizado com sucesso!'
          : 'Webhook verificado com sucesso! URL já estava correta.',
        {
          statusData,
          webhookData,
          configuredUrl: webhookUrl,
          previousUrl: currentWebhook,
        },
      )
      toast.success('Webhook verificado com sucesso!')
    } catch (error: any) {
      toast.error('Erro de rede ao testar webhook.')
      await updateDbStatus('error', `Falha de rede: ${error.message}`)
      await logWhatsAppEvent(user.id, 'webhook_health_check', 'Erro de rede durante health check', {
        error: error.message,
      })
    } finally {
      setIsTestingWebhook(false)
    }
  }

  return {
    qrModalOpen,
    setQrModalOpen,
    qrLoading,
    qrImage,
    qrError,
    requiresReset,
    isTestingWebhook,
    handleConnect,
    handleDisconnect,
    handleReset,
    handleTestWebhook,
    updateDbStatus,
  }
}
