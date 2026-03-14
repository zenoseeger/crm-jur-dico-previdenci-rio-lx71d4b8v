import React from 'react'
import { Lead } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function SummaryTab({ lead }: { lead: Lead }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Telefone</p>
          <p className="text-sm font-medium">{lead.phone}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Cidade</p>
          <p className="text-sm font-medium">{lead.city}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Benefício Alvo</p>
          <p className="text-sm font-medium text-primary">{lead.benefitType}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Responsável</p>
          <p className="text-sm font-medium">{lead.assignee}</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Tags Ativas</h4>
        <div className="flex flex-wrap gap-2">
          {lead.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-3 py-1 bg-accent/20 text-accent-foreground"
            >
              {tag}
            </Badge>
          ))}
          <Badge variant="outline" className="px-3 py-1 border-dashed">
            + Add Tag
          </Badge>
        </div>
      </div>

      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold">AI Triage Score</h4>
          <span className="text-lg font-bold text-primary">{lead.aiScore}/100</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Lead com alta probabilidade de conversão. Respondeu todas as perguntas iniciais e possui
          documentação prévia indicada.
        </p>
      </div>
    </div>
  )
}

export function QualTab() {
  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-lg p-4 space-y-4 shadow-sm">
        <h4 className="font-semibold text-sm border-b pb-2">Dados Estruturados pela IA</h4>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tempo de Contribuição:</span>
            <span className="font-medium">18 anos e 4 meses</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Idade:</span>
            <span className="font-medium">62 anos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trabalho Rural:</span>
            <span className="font-medium">Sim (1980 - 1995)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tentativa Anterior (INSS):</span>
            <span className="font-medium text-destructive">Negado em 2022</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Anotações do Advogado</h4>
        <textarea
          className="w-full min-h-[150px] p-3 text-sm rounded-md border bg-muted/30 focus:bg-background focus:ring-2 ring-primary outline-none transition-all resize-none"
          placeholder="Adicione notas privadas aqui..."
          defaultValue="Cliente tem direito adquirido antes da reforma. Focar na averbação do período rural. Falta apenas o CNIS atualizado."
        />
      </div>
    </div>
  )
}

export function HistoryTab() {
  const events = [
    { time: '14:30 Hoje', action: 'Lead movido para Análise Jurídica por SDR João' },
    { time: '10:15 Hoje', action: 'Documento CNH aprovado pela IA' },
    { time: '09:00 Hoje', action: 'Tag "Segurado Qualificado" adicionada automaticamente' },
    { time: '08:45 Hoje', action: 'Chat iniciado via automação WhatsApp' },
    { time: '08:45 Hoje', action: 'Lead criado via Integração Meta Ads' },
  ]

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="relative border-l border-border/60 ml-3 space-y-6 pb-4">
        {events.map((ev, i) => (
          <div key={i} className="relative pl-6">
            <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
            <div className="text-xs text-muted-foreground mb-1 font-mono">{ev.time}</div>
            <p className="text-sm font-medium text-foreground">{ev.action}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
