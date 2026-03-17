import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, CheckCircle, TrendingUp, FileText, CheckSquare, AlertTriangle } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'

import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'
import { DatePickerWithRange } from '@/components/DateRangePicker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Dashboard() {
  const { leads, currentPipelineId, setCurrentPipelineId } = useLeadStore()
  const { pipelineStages, pipelines } = useAdminStore()

  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  useEffect(() => {
    if (!currentPipelineId && pipelines.length > 0) {
      setCurrentPipelineId(pipelines[0].id)
    }
  }, [currentPipelineId, pipelines, setCurrentPipelineId])

  const activePipelineId = currentPipelineId || pipelines[0]?.id

  const filteredLeads = useMemo(() => {
    let result = leads.filter((l) => l.pipelineId === activePipelineId)
    if (date?.from) {
      result = result.filter((lead) => {
        if (!lead.createdAt) return true
        const leadDate = parseISO(lead.createdAt)
        if (date.to) {
          return isWithinInterval(leadDate, { start: date.from, end: date.to })
        }
        return leadDate >= date.from
      })
    }
    return result
  }, [leads, activePipelineId, date])

  const totalLeads = filteredLeads.length
  const pendingTasks = filteredLeads
    .flatMap((l) => l.tasks || [])
    .filter((t) => !t.completed).length

  const activeStages = useMemo(() => {
    return pipelineStages
      .filter((s) => s.pipelineId === activePipelineId)
      .sort((a, b) => a.order - b.order)
  }, [pipelineStages, activePipelineId])

  const newLeadStage = activeStages[0]?.name || 'NOVO LEAD'
  const qualifiedLeads = filteredLeads.filter((l) => l.stage !== newLeadStage).length
  const qualRate = totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) : '0.0'

  const contractsSigned = filteredLeads.filter(
    (l) => l.stage === 'GANHO' || l.stage === 'CONTRATO ENVIADO',
  ).length

  const chartConfig = useMemo(() => {
    const config: Record<string, any> = { count: { label: 'Leads' } }
    activeStages.forEach((s, i) => {
      config[s.id] = { color: `hsl(var(--primary) / ${Math.max(0.3, 1 - i * 0.15)})` }
    })
    return config
  }, [activeStages])

  const funnelData = useMemo(() => {
    return activeStages.map((s) => ({
      stage: s.name,
      count: filteredLeads.filter((l) => l.stage === s.name).length,
      fill: `var(--color-${s.id})`,
    }))
  }, [filteredLeads, activeStages])

  return (
    <div className="p-6 space-y-6 bg-muted/10 min-h-full animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground">Visão geral do funil comercial e performance.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Select value={activePipelineId} onValueChange={setCurrentPipelineId}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background">
              <SelectValue placeholder="Selecione o Pipeline" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePickerWithRange date={date} setDate={setDate} className="w-full sm:w-auto" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Qualificação</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualRate}%</div>
            <p className="text-xs text-muted-foreground">{qualifiedLeads} leads qualificados</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos / Ganhos</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractsSigned}</div>
            <p className="text-xs text-muted-foreground">Negócios no período</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <CheckSquare className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Ações comerciais requeridas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>Volume de leads por etapa do processo comercial.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {funnelData.some((d) => d.count > 0) ? (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={funnelData}
                    layout="vertical"
                    margin={{ top: 0, right: 0, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="stage"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      fontSize={11}
                      width={120}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm flex-col gap-2">
                <FileText className="h-8 w-8 opacity-20" />
                <p>Nenhum dado para o período selecionado.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-border/50 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Leads Aguardando Ação</CardTitle>
            <CardDescription>Leads não lidos ou parados precisando de atenção.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {filteredLeads
                .filter((l) => l.unread)
                .slice(0, 5)
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.stage} • {lead.assignee}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-destructive flex items-center gap-1 justify-end">
                        <AlertTriangle className="h-3 w-3" /> Não lido
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {lead.timeInStage} na etapa
                      </p>
                    </div>
                  </div>
                ))}
              {filteredLeads.filter((l) => l.unread).length === 0 && (
                <div className="flex py-6 items-center justify-center text-muted-foreground text-sm flex-col gap-2 border-dashed border-2 rounded-lg">
                  <CheckCircle className="h-6 w-6 opacity-20" />
                  <p>Todos os leads estão atualizados!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
