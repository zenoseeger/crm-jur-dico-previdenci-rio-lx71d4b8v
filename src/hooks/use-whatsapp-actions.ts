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

  const getHeaders = (isJson = false) => {
    const headers: Record<string, string> = {}
    if (isJson) headers['Content-Type'] = 'application/json'
    if (config.client_token) {
      // Must be 'Client-Token' exactly as per Z-API requirements for authentication
      headers['Client-Token'] = config.client_token.trim()
    }
    return headers
  }

  // Gracefully extracts the error message to avoid UI crashes
  const parseApiError = (data: any, defaultMsg: string) => {
    if (!data) return defaultMsg
    if (typeof data === 'string') return data
    if (typeof data.error === 'string') return data.error
    if (typeof data.message === 'string') return data.message
    if (typeof data.title === 'string') return data.title
    if (data.error && typeof data.error === 'object') return JSON.stringify(data.error)
    return defaultMsg
  }

  const updateDbStatus = async (status: string, lastError: string | null = null) => {
    if (!config.id) return
    await supabase
      .from('whatsapp_configs')
      .update({ status, last_error: lastError })
      .eq('id', config.id)
    setConfig((prev: any) => ({ ...prev, status, last_error: lastError }))
  }

  const handleConnect = async () => {
    const instanceId = config.instance_id?.trim()
    const token = config.token?.trim()
    const clientToken = config.client_token?.trim()

    if (!instanceId || !token) {
      toast.error('Informe o ID e o Token da Instância primeiro.')
      return
    }

    if (!clientToken) {
      toast.error('O Client Token é obrigatório para autenticar as requisições na Z-API.')
      return
    }

    setQrModalOpen(true)
    setQrLoading(true)
    setQrError(null)
    setQrImage(null)
    setRequiresReset(false)

    try {
      const statusRes = await fetch(
        `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
        { headers: getHeaders() },
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
        `https://api.z-api.io/instances/${instanceId}/token/${token}/qr-code/image`,
        { headers: getHeaders() },
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
        let errorBody: any = {}
        try {
          const text = await res.text()
          try {
            errorBody = JSON.parse(text)
          } catch {
            errorBody = { message: text }
          }
        } catch (e) {
          // ignore parsing error
        }

        const errorMessage = parseApiError(errorBody, `Erro HTTP ${res.status}`)

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
      const errMsg = error.message || 'Erro de rede ao comunicar com Z-API.'
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
    const instanceId = config.instance_id?.trim()
    const token = config.token?.trim()
    if (!instanceId || !token) return
    try {
      await fetch(
        `https://api.z-api.io/instances/${instanceId}/token/${token}/disconnect-account`,
        { method: 'POST', headers: getHeaders() },
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
    const instanceId = config.instance_id?.trim()
    const token = config.token?.trim()
    if (!instanceId || !token) return
    try {
      await fetch(
        `https://api.z-api.io/instances/${instanceId}/token/${token}/disconnect-account`,
        { method: 'POST', headers: getHeaders() },
      )
      await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/disconnect`, {
        headers: getHeaders(),
      })
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
    const instanceId = config.instance_id?.trim()
    const token = config.token?.trim()
    const clientToken = config.client_token?.trim()

    if (!instanceId || !token || !clientToken) {
      if (!clientToken) {
        toast.error(
          'Client Token não configurado. Por favor, preencha o campo Client Token e clique em Salvar antes de testar.',
        )
      } else {
        toast.error('Configuração incompleta: Instance ID ou Token da Instância ausente.')
      }
      return
    }

    setIsTestingWebhook(true)
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bnuripqdjxiympxhlthy.supabase.co'
    const webhookUrl = `${baseUrl}/functions/v1/zapi-webhook`

    try {
      const statusRes = await fetch(
        `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
        { headers: getHeaders() },
      )

      let statusData: any = {}
      try {
        const text = await statusRes.text()
        try {
          statusData = JSON.parse(text)
        } catch {
          statusData = { message: text }
        }
      } catch (e) {
        // ignore parsing error
      }

      if (!statusRes.ok) {
        let errMsg = 'Erro desconhecido na Z-API.'
        if (statusRes.status === 401 || statusRes.status === 403) {
          errMsg = 'Falha na autenticação: Client Token inválido ou não autorizado.'
        } else if (statusRes.status === 404) {
          errMsg = 'Instância não encontrada: Verifique o Instance ID e Token.'
        } else if (statusRes.status === 400) {
          errMsg = parseApiError(statusData, 'Erro na requisição (400). Verifique os parâmetros.')
        } else {
          errMsg = parseApiError(statusData, `HTTP Erro ${statusRes.status}`)
        }

        toast.error(errMsg)
        await updateDbStatus('error', errMsg)
        await logWhatsAppEvent(user.id, 'health_check', `Falha de conectividade: ${errMsg}`, {
          status: statusRes.status,
          body: statusData,
        })
        setIsTestingWebhook(false)
        return
      }

      let currentWebhook = ''
      try {
        const getWebhookRes = await fetch(
          `https://api.z-api.io/instances/${instanceId}/token/${token}/webhook-delivery`,
          { headers: getHeaders() },
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
          `https://api.z-api.io/instances/${instanceId}/token/${token}/update-webhook-delivery`,
          {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify({ value: webhookUrl }),
          },
        )

        try {
          const wText = await webhookRes.text()
          try {
            webhookData = JSON.parse(wText)
          } catch {
            webhookData = { message: wText }
          }
        } catch (e) {
          // ignore parsing error
        }

        if (!webhookRes.ok) {
          const errMsg = parseApiError(
            webhookData,
            `Erro HTTP ${webhookRes.status} ao configurar webhook.`,
          )
          toast.error(`Falha ao configurar webhook: ${errMsg}`)
          await updateDbStatus('error', `Falha no Webhook: ${errMsg}`)
          await logWhatsAppEvent(
            user.id,
            'health_check',
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
        'health_check',
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
      await logWhatsAppEvent(user.id, 'health_check', 'Erro de rede durante health check', {
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
