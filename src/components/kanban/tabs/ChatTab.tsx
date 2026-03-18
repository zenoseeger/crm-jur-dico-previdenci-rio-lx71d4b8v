import React, { useState, useEffect } from 'react'
import { Send, Bot, KeyRound, CheckCircle2 } from 'lucide-react'
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

export function ChatTab({ lead }: { lead: Lead }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sendAsLead, setSendAsLead] = useState(false)
  const [config, setConfig] = useState<DbWhatsAppConfig | null>(null)

  const { toggleLeadAI, markAITriggered } = useLeadStore()
  const { aiConfig } = useAdminStore()

  useEffect(() => {
    if (!user || !lead.id) return

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
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [user, lead.id])

  const aiEnabledForLead = lead.aiEnabled !== false
  const globalAiEnabled = aiConfig.enabled

  const isWaitingKeyword =
    globalAiEnabled && aiEnabledForLead && aiConfig.triggerMode === 'keyword' && !lead.aiTriggered

  const sendMessageToDbAndZapi = async (
    text: string,
    direction: 'inbound' | 'outbound',
    isAi: boolean = false,
  ) => {
    if (!user) return

    const newMsg = {
      user_id: user.id,
      lead_id: lead.id,
      content: isAi ? `[IA] ${text}` : text,
      direction,
      message_type: 'text',
    }

    const { data } = await supabase.from('messages').insert(newMsg).select().single()
    if (data) {
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.id)) return prev
        return [...prev, data as Message]
      })
    }

    if (
      direction === 'outbound' &&
      config?.provider === 'z-api' &&
      config.instance_id &&
      config.token
    ) {
      const phone = lead.phone.replace(/\D/g, '')
      const formattedPhone = phone.length <= 11 ? `55${phone}` : phone
      fetch(
        `https://api.z-api.io/instances/${config.instance_id}/token/${config.token}/send-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Token': config.client_token || '',
          },
          body: JSON.stringify({ phone: formattedPhone, message: text }),
        },
      ).catch(console.error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

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
            <p className="text-sm font-semibold">{lead.name}</p>
            <p className="text-xs text-muted-foreground">{lead.phone}</p>
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
                  <p className="leading-relaxed whitespace-pre-wrap">{displayText}</p>
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
                    {new Date(msg.created_at).toLocaleTimeString([], {
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
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={sendAsLead ? 'Digite como Lead...' : 'Digite uma mensagem...'}
            className="flex-1 bg-muted/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className={cn(
              'shrink-0 rounded-full w-10 h-10 shadow-md',
              sendAsLead ? 'bg-amber-500 hover:bg-amber-600 text-white' : '',
            )}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
