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
        .limit(10)
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
          setLogs((prev) => [payload.new, ...prev].slice(0, 10))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[140px]">Data/Hora</TableHead>
          <TableHead className="w-[160px]">Evento</TableHead>
          <TableHead>Mensagem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="text-xs text-muted-foreground">
              {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ptBR })}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className="text-[10px] uppercase bg-muted/50 border-muted-foreground/20"
              >
                {log.event_type}
              </Badge>
            </TableCell>
            <TableCell className="text-sm">{log.message}</TableCell>
          </TableRow>
        ))}
        {logs.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm">
              Nenhum log de conexão registrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
