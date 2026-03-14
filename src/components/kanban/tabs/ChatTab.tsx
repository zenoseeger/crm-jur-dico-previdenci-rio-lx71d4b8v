import React, { useState, useEffect } from 'react'
import { Send, Bot, User, ToggleLeft, ToggleRight } from 'lucide-react'
import { Lead } from '@/types'
import { MOCK_CHAT } from '@/lib/mockData'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function ChatTab({ lead }: { lead: Lead }) {
  const [messages, setMessages] = useState(
    MOCK_CHAT.filter((c) => c.leadId === lead.id || c.leadId === 'l1'),
  ) // Fallback to l1
  const [input, setInput] = useState('')
  const [aiEnabled, setAiEnabled] = useState(true)

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        leadId: lead.id,
        sender: 'sdr',
        text: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInput('')
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
        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-full px-3 border border-border/50">
          <Bot className={cn('w-4 h-4', aiEnabled ? 'text-primary' : 'text-muted-foreground')} />
          <Label htmlFor="ai-toggle" className="text-xs cursor-pointer">
            IA
          </Label>
          <Switch
            id="ai-toggle"
            checked={aiEnabled}
            onCheckedChange={setAiEnabled}
            className="scale-75 data-[state=checked]:bg-primary"
          />
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
                      SDR
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

      <div className="p-3 bg-background border-t">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-muted/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-full w-10 h-10 shadow-md transition-transform active:scale-95"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
