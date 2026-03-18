import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function WhatsAppLogs({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return

    const fetchLogs = async () => {
      const { data } = await supabase
        .from('whatsapp_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setLogs(data)
    }

    fetchLogs()

    const channel = supabase
      .channel('logs_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_logs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setLogs((prev) => [payload.new, ...prev].slice(0, 20))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <div className="max-h-[500px] overflow-auto relative">
      <Table>
        <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 shadow-sm border-b">
          <TableRow>
            <TableHead className="w-[140px] whitespace-nowrap">Data/Hora</TableHead>
            <TableHead className="w-[160px] whitespace-nowrap">Tipo de Evento</TableHead>
            <TableHead>Mensagem</TableHead>
            <TableHead className="w-[280px]">Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap align-top pt-4">
                {format(new Date(log.created_at), 'dd/MM HH:mm:ss', { locale: ptBR })}
              </TableCell>
              <TableCell className="align-top pt-4">
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase border-muted-foreground/20 whitespace-nowrap ${
                    log.event_type === 'connection_error' || log.event_type === 'ERROR'
                      ? 'bg-destructive/10 text-destructive border-destructive/30 font-bold'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {log.event_type}
                </Badge>
              </TableCell>
              <TableCell className="text-sm font-medium align-top pt-4 text-slate-800 dark:text-slate-200">
                {log.message}
              </TableCell>
              <TableCell className="align-top py-3">
                {log.details && Object.keys(log.details).length > 0 ? (
                  <div className="bg-muted/50 border border-border/50 p-2 rounded-md text-[10px] font-mono text-muted-foreground max-h-[120px] overflow-y-auto w-full whitespace-pre-wrap break-all shadow-inner">
                    {JSON.stringify(log.details, null, 2)}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs italic">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-sm">
                Nenhum log de diagnóstico registrado ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
