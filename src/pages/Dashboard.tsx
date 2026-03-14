import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const funnelData = [
  { stage: 'Novo Lead', count: 120, fill: 'var(--color-stage1)' },
  { stage: 'Qualificação', count: 85, fill: 'var(--color-stage2)' },
  { stage: 'Aguardando Doc', count: 60, fill: 'var(--color-stage3)' },
  { stage: 'Análise Jurídica', count: 45, fill: 'var(--color-stage4)' },
  { stage: 'Reunião', count: 30, fill: 'var(--color-stage5)' },
  { stage: 'Contrato', count: 25, fill: 'var(--color-stage6)' },
  { stage: 'Cliente', count: 18, fill: 'var(--color-stage7)' },
];

const chartConfig = {
  count: { label: "Leads" },
  stage1: { color: "hsl(var(--primary))" },
  stage2: { color: "hsl(var(--primary) / 0.9)" },
  stage3: { color: "hsl(var(--primary) / 0.8)" },
  stage4: { color: "hsl(var(--primary) / 0.7)" },
  stage5: { color: "hsl(var(--accent))" },
  stage6: { color: "hsl(var(--success))" },
  stage7: { color: "hsl(var(--success))" },
};

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 bg-muted/10 min-h-full animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">Visão geral do funil comercial e performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Qualificação</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">70.8%</div>
            <p className="text-xs text-muted-foreground">+2.1% desde o último mês</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Assinados</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Dos 30 que chegaram à reunião</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio Resposta SDR</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 min</div>
            <p className="text-xs text-muted-foreground">-3 min de melhoria (meta: < 15m)</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Sem Resposta > 48h</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">5</div>
            <p className="text-xs text-muted-foreground">Ação imediata requerida</p>
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
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} fontSize={12} width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Alertas de Follow-up</CardTitle>
            <CardDescription>Leads parados aguardando ação da equipe.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">José Alberto Silva</p>
                    <p className="text-xs text-muted-foreground">Aguardando Documentos • SDR João</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-destructive">3 dias</p>
                    <p className="text-[10px] text-muted-foreground">sem interação</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
