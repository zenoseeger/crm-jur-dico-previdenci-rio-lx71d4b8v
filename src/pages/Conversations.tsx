import React, { useState, useEffect } from 'react'
import useLeadStore from '@/stores/useLeadStore'
import { ChatTab } from '@/components/kanban/tabs/ChatTab'
import { Input } from '@/components/ui/input'
import { Search, MessageSquare, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { isToday, isYesterday, format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Ontem'
  return format(date, 'dd/MM')
}

export default function Conversations() {
  const { leads, markAsRead } = useLeadStore()
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [lastMessages, setLastMessages] = useState<
    Record<string, { content: string; date: string }>
  >({})

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await supabase
        .from('messages')
        .select('lead_id, content, created_at')
        .order('created_at', { ascending: false })

      if (data) {
        const map: Record<string, any> = {}
        data.forEach((m) => {
          if (m.lead_id && !map[m.lead_id]) {
            map[m.lead_id] = { content: m.content, date: m.created_at }
          }
        })
        setLastMessages(map)
      }
    }
    fetchLatest()

    const sub = supabase
      .channel('msgs_all_pages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (p) => {
        if (p.new.lead_id) {
          setLastMessages((prev) => ({
            ...prev,
            [p.new.lead_id]: { content: p.new.content, date: p.new.created_at },
          }))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [])

  const sortedLeads = leads
    .filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search))
    .sort((a, b) => {
      const dateA = lastMessages[a.id]?.date
        ? new Date(lastMessages[a.id].date).getTime()
        : new Date(a.createdAt).getTime()
      const dateB = lastMessages[b.id]?.date
        ? new Date(lastMessages[b.id].date).getTime()
        : new Date(b.createdAt).getTime()
      return dateB - dateA
    })

  const activeLead = leads.find((l) => l.id === activeLeadId) || null

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Left Sidebar */}
      <div className="w-full sm:w-[350px] border-r flex flex-col shrink-0 bg-muted/10">
        <div className="p-4 border-b bg-background">
          <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Conversas
          </h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              className="pl-8 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {sortedLeads.map((lead) => {
              const lastMsg = lastMessages[lead.id]
              const isActive = activeLeadId === lead.id

              return (
                <button
                  key={lead.id}
                  onClick={() => {
                    setActiveLeadId(lead.id)
                    if (lead.unread) markAsRead(lead.id)
                  }}
                  className="opacity-[0.98]"
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    {lead.unread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-medium text-sm truncate pr-2">{lead.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {lastMsg ? formatTime(lastMsg.date) : formatTime(lead.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate h-4">
                      {lastMsg
                        ? lastMsg.content.includes('[Áudio recebido]')
                          ? '🎵 Áudio'
                          : lastMsg.content.includes('[Imagem recebida]')
                            ? '📷 Imagem'
                            : lastMsg.content.replace('[IA] ', '')
                        : 'Nenhuma mensagem ainda'}
                    </div>
                  </div>
                </button>
              )
            })}
            {sortedLeads.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                <Clock className="w-6 h-6 opacity-20" />
                Nenhuma conversa encontrada.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 hidden sm:flex flex-col min-w-0 bg-slate-50 dark:bg-muted/5">
        {activeLead ? (
          <ChatTab lead={activeLead} className="rounded-none border-none shadow-none" />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="bg-primary/5 p-4 rounded-full mb-4">
              <MessageSquare className="w-12 h-12 text-primary opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-foreground">Suas Mensagens</h3>
            <p className="text-sm mt-1">Selecione um contato ao lado para iniciar a conversa.</p>
          </div>
        )}
      </div>

      {/* Mobile Right Area Overlay (optional if we want responsive, but hidden by default based on sm:hidden) */}
      {activeLead && (
        <div className="fixed inset-0 z-50 bg-background sm:hidden flex flex-col animate-in slide-in-from-right-full">
          <div className="h-14 border-b flex items-center px-2 shrink-0">
            <button
              onClick={() => setActiveLeadId(null)}
              className="p-2 text-primary text-sm font-medium"
            >
              ← Voltar
            </button>
          </div>
          <ChatTab lead={activeLead} className="flex-1 rounded-none border-none shadow-none" />
        </div>
      )}
    </div>
  )
}
