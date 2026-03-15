import React, { useState } from 'react'
import { Send, Bot } from 'lucide-react'
import { Lead, ChatMessage } from '@/types'
import { MOCK_CHAT } from '@/lib/mockData'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'

export function ChatTab({ lead }: { lead: Lead }) {
  const [messages, setMessages] = useState(
    MOCK_CHAT.filter((c) => c.leadId === lead.id || c.leadId === 'l1'),
  )
  const [input, setInput] = useState('')
  const [sendAsLead, setSendAsLead] = useState(false)

  const { toggleLeadAI } = useLeadStore()
  const { aiConfig } = useAdminStore()

  const aiEnabledForLead = lead.aiEnabled !== false
  const globalAiEnabled = aiConfig.enabled

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      leadId: lead.id,
      sender: sendAsLead ? 'lead' : 'sdr',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const nextMessages = [...messages, newMsg]
    setMessages(nextMessages)
    setInput('')

    // Simulate Conversation Context Awareness
    if (sendAsLead && aiEnabledForLead && globalAiEnabled) {
      setTimeout(() => {
        const previousMsgs = nextMessages.slice(-4)
        const contextStr = previousMsgs
          .map((m) => `${m.sender === 'lead' ? 'Lead' : 'Atendente'}: ${m.text}`)
          .join(' | ')
          .substring(0, 120)

        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          leadId: lead.id,
          sender: 'ai',
          text: `Baseando-me no contexto anterior ("...${contextStr}...") e consultando a Base de Conhecimento do escritório, compreendi sua dúvida. Como posso auxiliar com as documentações restantes?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1500)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5]/20 dark:bg-muted/10 rounded-md border overflow-hidden relative">
      <div className="bg-background border-b p-3 flex justify-between items-center z-10 shadow-sm">
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
          {(!aiEnabledForLead || !globalAiEnabled) && (
            <Badge
              variant="destructive"
              className="h-6 px-2 text-[10px] font-bold shadow-sm whitespace-nowrap uppercase tracking-wider"
            >
              Agente Desativado
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
              title={
                !globalAiEnabled
                  ? 'Agente está desativado globalmente'
                  : 'Desativar assistente IA para este lead'
              }
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
          <div className="text-center my-4">
            <span className="bg-card text-muted-foreground text-[10px] px-2 py-1 rounded-md shadow-sm border border-border/50">
              Hoje
            </span>
          </div>
          {messages.map((msg) => {
            const isLead = msg.sender === 'lead'
            const isAi = msg.sender === 'ai'

            return (
              <div
                key={msg.id}
                className={cn('flex w-full', isLead ? 'justify-start' : 'justify-end')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3 shadow-sm relative text-sm animate-fade-in-up',
                    isLead
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
                  {msg.sender === 'sdr' && (
                    <span className="text-[10px] font-bold text-primary-foreground/80 mb-1 block">
                      Equipe
                    </span>
                  )}

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  <div
                    className={cn(
                      'text-[9px] mt-1 text-right',
                      isLead
                        ? 'text-muted-foreground'
                        : isAi
                          ? 'text-primary/60'
                          : 'text-primary-foreground/70',
                    )}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            )
          })}
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
          {sendAsLead && (!aiEnabledForLead || !globalAiEnabled) && (
            <span className="text-[10px] text-destructive font-medium flex items-center gap-1 animate-fade-in">
              <Bot className="w-3 h-3" /> IA Silenciada
            </span>
          )}
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
            className={cn(
              'shrink-0 rounded-full w-10 h-10 shadow-md transition-transform active:scale-95',
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
