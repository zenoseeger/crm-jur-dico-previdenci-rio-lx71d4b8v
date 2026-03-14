import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function Reports() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Relatórios Avançados</h1>
      <p className="text-muted-foreground">Analise o desempenho da equipe e a origem dos leads.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Origem de Leads (Meta Ads vs Orgânico)</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t bg-muted/10 text-muted-foreground">
            Gráfico de Origens
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Motivos de Perda</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t bg-muted/10 text-muted-foreground">
            Gráfico de Pizza (Falta de Tempo, Desistência, etc)
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance por SDR/Closer</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t bg-muted/10 text-muted-foreground">
            Tabela de Conversão Detalhada
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
