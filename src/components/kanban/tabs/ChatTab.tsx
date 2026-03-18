import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, KeyRound, CheckCircle2, Paperclip, Loader2, Mic, Trash2 } from 'lucide-react'
import { Lead, Message, DbWhatsAppConfig } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function ChatTab({ lead }: { lead: Lead }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sendAsLead, setSendAsLead] = useState(false)
  const [config, setConfig] = useState<DbWhatsAppConfig | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toggleLeadAI, markAITriggered, markAsRead } = useLeadStore()
  const { aiConfig } = useAdminStore()

  useEffect(() => {
    if (!user || !lead.id) return

    if (lead.unread) {
      markAsRead(lead.id)
    }

    supabase
      .from('messages')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at')
      .then((res) => {
        if (res.data) setMessages(res.data)
      })

    supabase
      .from('whatsapp_configs')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then((res) => {
        if (res.data) setConfig(res.data)
      })

    const sub = supabase
      .channel(`msgs_${lead.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `lead_id=eq.${lead.id}` },
        (p) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === p.new.id)) return prev
            return [...prev, p.new as Message]
          })

          if (p.new.direction === 'inbound') {
            markAsRead(lead.id)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [user, lead.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const aiEnabledForLead = lead.aiEnabled !== false
  const globalAiEnabled = aiConfig.enabled

  const isWaitingKeyword =
    globalAiEnabled && aiEnabledForLead && aiConfig.triggerMode === 'keyword' && !lead.aiTriggered

  const sendMessageToDbAndZapi = async (
    text: string,
    direction: 'inbound' | 'outbound',
    isAi: boolean = false,
    mediaUrl: string | null = null,
    messageType: string = 'text',
  ) => {
    if (!user) return

    // Ensure absolutely clean text, removing any leading/trailing whitespace
    const cleanText = text.trim()

    const newMsg = {
      user_id: user.id,
      lead_id: lead.id,
      content: isAi ? `[IA] ${cleanText}` : cleanText,
      direction,
      message_type: messageType,
      media_url: mediaUrl,
    }

    // 1. Database Consistency: Save the clean version reflecting exactly what was intended
    const { data, error } = await supabase.from('messages').insert(newMsg).select().single()
    if (error) {
      toast.error('Erro ao salvar a mensagem no banco de dados.')
      return
    }

    if (data) {
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.id)) return prev
        return [...prev, data as Message]
      })
    }

    // 2. Validation of Configuration & Clean Message Sending Logic
    if (direction === 'outbound' && config?.provider === 'z-api') {
      if (!config.instance_id || !config.token || !config.client_token) {
        toast.error(
          'Configuração do WhatsApp incompleta. Verifique Instance ID, Token e Client Token na aba de Administração.',
        )
        return
      }

      const phone = lead.phone.replace(/\D/g, '')
      const formattedPhone = phone.length <= 11 ? `55${phone}` : phone

      try {
        let url = `https://api.z-api.io/instances/${config.instance_id.trim()}/token/${config.token.trim()}/send-text`
        let body: any = { phone: formattedPhone, message: cleanText }

        if (messageType === 'image' && mediaUrl) {
          url = `https://api.z-api.io/instances/${config.instance_id.trim()}/token/${config.token.trim()}/send-image`
          body = { phone: formattedPhone, image: mediaUrl, caption: cleanText }
        } else if (messageType === 'audio' && mediaUrl) {
          url = `https://api.z-api.io/instances/${config.instance_id.trim()}/token/${config.token.trim()}/send-audio`
          body = { phone: formattedPhone, audio: mediaUrl }
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Token': config.client_token.trim(),
          },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const errText = await res.text()
          toast.error('Falha ao enviar mensagem no WhatsApp. Verifique sua conexão ou credenciais.')
          await supabase.from('whatsapp_logs').insert({
            user_id: user.id,
            event_type: 'MESSAGE_SEND_ERROR',
            message: `Erro ao enviar mensagem para ${formattedPhone}`,
            details: {
              status: res.status,
              response: errText,
              text: cleanText,
              mediaUrl,
              messageType,
            },
          })
        }
      } catch (err: any) {
        toast.error('Erro de rede ao comunicar com Z-API.')
        await supabase.from('whatsapp_logs').insert({
          user_id: user.id,
          event_type: 'MESSAGE_SEND_ERROR',
          message: `Erro de rede ao enviar para ${formattedPhone}`,
          details: { error: err.message, text: cleanText, mediaUrl, messageType },
        })
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('O arquivo não pode exceder 10MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const isImage = file.type.startsWith('image/')
    const isAudio = file.type.startsWith('audio/')
    if (!isImage && !isAudio) {
      toast.error('Apenas imagens e áudios são suportados no momento.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user?.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage.from('chat-media').getPublicUrl(filePath)

      const type = isImage ? 'image' : 'audio'
      const caption = type === 'image' ? input : ''

      if (type === 'image' && input) {
        setInput('')
      }

      await sendMessageToDbAndZapi(
        caption,
        sendAsLead ? 'inbound' : 'outbound',
        false,
        publicUrlData.publicUrl,
        type,
      )
    } catch (err: any) {
      toast.error('Erro ao fazer upload do arquivo.')
      console.error(err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      toast.error('Erro ao acessar o microfone. Verifique as permissões do navegador.')
      console.error('Mic error:', err)
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
      audioChunksRef.current = []
    }
  }

  const uploadAndSendAudio = async (blob: Blob) => {
    setIsUploading(true)
    try {
      const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'm4a' : 'webm'
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
      const filePath = `${user?.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, blob, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('chat-media').getPublicUrl(filePath)

      await sendMessageToDbAndZapi(
        '', // Empty text for audio
        sendAsLead ? 'inbound' : 'outbound',
        false,
        publicUrlData.publicUrl,
        'audio',
      )
    } catch (err: any) {
      toast.error('Erro ao enviar áudio.')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop())
        if (timerRef.current) clearInterval(timerRef.current)
        setIsRecording(false)

        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        audioChunksRef.current = []

        await uploadAndSendAudio(audioBlob)
      }
      mediaRecorderRef.current.stop()
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isUploading) return

    const userText = input
    setInput('')

    await sendMessageToDbAndZapi(userText, sendAsLead ? 'inbound' : 'outbound')

    if (sendAsLead && aiEnabledForLead && globalAiEnabled) {
      let shouldTrigger = false

      if (aiConfig.triggerMode === 'always' || lead.aiTriggered) {
        shouldTrigger = true
      } else if (aiConfig.triggerMode === 'keyword') {
        const msgText = userText.toLowerCase()
        const kw = aiConfig.triggerKeyword.toLowerCase()
        if (aiConfig.triggerCondition === 'equals' && msgText.trim() === kw.trim()) {
          shouldTrigger = true
        } else if (aiConfig.triggerCondition === 'contains' && msgText.includes(kw)) {
          shouldTrigger = true
        }
      }

      if (shouldTrigger) {
        if (!lead.aiTriggered) markAITriggered(lead.id)
        setTimeout(() => {
          const aiResponseText = `Baseando-me no contexto anterior e consultando a Base de Conhecimento do escritório, compreendi sua dúvida. Como posso auxiliar com as documentações restantes?`
          sendMessageToDbAndZapi(aiResponseText, 'outbound', true)
        }, 1500)
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5]/20 dark:bg-muted/10 rounded-md border overflow-hidden relative">
      <div className="bg-background border-b p-3 flex justify-between items-center z-10 shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
            {lead.name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-semibold">{lead.name}</div>
            <div className="text-xs text-muted-foreground">{lead.phone}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!aiEnabledForLead || !globalAiEnabled ? (
            <Badge
              variant="destructive"
              className="h-6 px-2 text-[10px] font-bold shadow-sm whitespace-nowrap uppercase tracking-wider"
            >
              Agente Desativado
            </Badge>
          ) : isWaitingKeyword ? (
            <Badge
              variant="outline"
              className="h-6 px-2 text-[10px] font-bold shadow-sm whitespace-nowrap bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1"
            >
              <KeyRound className="w-3 h-3" /> Aguardando Gatilho
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="h-6 px-2 text-[10px] font-bold shadow-sm whitespace-nowrap bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1"
            >
              <CheckCircle2 className="w-3 h-3" /> Agente Ativo
            </Badge>
          )}

          <div
            className={cn(
              'flex items-center gap-2 p-1.5 rounded-full px-3 border transition-colors',
              !aiEnabledForLead
                ? 'bg-destructive/10 border-destructive/30'
                : 'bg-muted/50 border-border/50',
            )}
          >
            <Switch
              id="ai-disable-toggle"
              checked={!aiEnabledForLead}
              onCheckedChange={(val) => toggleLeadAI(lead.id, !val)}
              className="scale-75 data-[state=checked]:bg-destructive"
              disabled={!globalAiEnabled}
            />
            <Label
              htmlFor="ai-disable-toggle"
              className={cn(
                'text-xs cursor-pointer font-medium select-none',
                !aiEnabledForLead && 'text-destructive',
              )}
            >
              Desativar Agente
            </Label>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3 pb-4">
          {messages.map((msg) => {
            const isInbound = msg.direction === 'inbound'
            const isAi = msg.content.startsWith('[IA] ')
            // Clean text rendering in UI reflecting the raw input
            const displayText = isAi ? msg.content.replace('[IA] ', '') : msg.content

            return (
              <div
                key={msg.id}
                className={cn('flex w-full', isInbound ? 'justify-start' : 'justify-end')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3 shadow-sm relative text-sm animate-fade-in-up',
                    isInbound
                      ? 'bg-card border border-border/50 text-foreground rounded-tl-none'
                      : isAi
                        ? 'bg-primary/5 border border-primary/20 text-foreground rounded-tr-none'
                        : 'bg-primary text-primary-foreground rounded-tr-none',
                  )}
                >
                  {isAi && (
                    <span className="text-[10px] font-bold text-primary mb-1 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> IA Triage
                    </span>
                  )}
                  {!isInbound && !isAi && (
                    <span className="text-[10px] font-bold text-primary-foreground/80 mb-1 block">
                      Equipe
                    </span>
                  )}

                  {msg.message_type === 'image' && msg.media_url && (
                    <div className="mb-2 mt-1">
                      <a href={msg.media_url} target="_blank" rel="noreferrer">
                        <img
                          src={msg.media_url}
                          alt="Anexo"
                          className="max-w-full h-auto max-h-48 rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity border border-border/50"
                        />
                      </a>
                    </div>
                  )}
                  {msg.message_type === 'audio' && msg.media_url && (
                    <div className="mb-2 mt-1">
                      <audio
                        controls
                        src={msg.media_url}
                        className="max-w-[220px] sm:max-w-[250px] h-10"
                      />
                    </div>
                  )}
                  {msg.message_type !== 'text' &&
                    msg.message_type !== 'image' &&
                    msg.message_type !== 'audio' &&
                    msg.media_url && (
                      <a
                        href={msg.media_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs underline mb-1 block"
                      >
                        Ver anexo ({msg.message_type})
                      </a>
                    )}

                  {/* Changed <p> to <div> to avoid theoretical React hydration/runtime nesting errors with external HTML */}
                  {displayText.length > 0 && (
                    <div className="leading-relaxed whitespace-pre-wrap break-words">
                      {displayText}
                    </div>
                  )}
                  <div
                    className={cn(
                      'text-[9px] mt-1 text-right',
                      isInbound
                        ? 'text-muted-foreground'
                        : isAi
                          ? 'text-primary/60'
                          : 'text-primary-foreground/70',
                    )}
                  >
                    {new Date(msg.created_at || new Date()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            )
          })}
          {messages.length === 0 && (
            <div className="text-center my-4 text-muted-foreground text-xs">
              Nenhuma mensagem no histórico.
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-3 bg-background border-t space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Switch
              id="sim-lead"
              checked={sendAsLead}
              onCheckedChange={setSendAsLead}
              className="scale-75 data-[state=checked]:bg-amber-500"
            />
            <Label htmlFor="sim-lead" className="text-xs text-muted-foreground cursor-pointer">
              Simular Lead (Testar IA)
            </Label>
          </div>
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 items-center w-full">
          {!isRecording && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </Button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,audio/*"
            onChange={handleFileUpload}
          />

          {isRecording ? (
            <div className="flex flex-1 items-center justify-between bg-destructive/5 border border-destructive/20 rounded-full px-4 h-10 animate-fade-in">
              <div className="flex items-center gap-3 text-destructive">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm font-mono font-medium tracking-wider">
                  {String(Math.floor(recordingDuration / 60)).padStart(2, '0')}:
                  {String(recordingDuration % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={cancelRecording}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 shadow-sm text-primary-foreground ml-1"
                  onClick={stopAndSendRecording}
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={sendAsLead ? 'Digite como Lead...' : 'Digite uma mensagem...'}
                className="flex-1 bg-muted/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary"
                disabled={isUploading}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={startRecording}
                disabled={isUploading}
                className="shrink-0 rounded-full w-10 h-10 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isUploading}
                className={cn(
                  'shrink-0 rounded-full w-10 h-10 shadow-md transition-all',
                  sendAsLead ? 'bg-amber-500 hover:bg-amber-600 text-white' : '',
                )}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
