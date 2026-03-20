import React, { useState, useEffect } from 'react'
import { Lead } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useAdminStore } from '@/stores/useAdminStore'
import useLeadStore from '@/stores/useLeadStore'
import { Button } from '@/components/ui/button'
import { Loader2, AlignLeft, Bot, X } from 'lucide-react'
import { toast } from 'sonner'

export function SummaryTab({ lead }: { lead: Lead }) {
  const { tags: adminTags } = useAdminStore()
  const { addTagToLead, removeTagFromLead, updateLeadNotes } = useLeadStore()
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(lead.notes || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setNotes(lead.notes || '')
  }, [lead.id, lead.notes])

  const handleSaveNotes = async () => {
    setIsSaving(true)
    try {
      await updateLeadNotes(lead.id, notes)
      toast.success('Notas salvas com sucesso!')
    } catch (err) {
      toast.error('Erro ao salvar notas. Tente novamente.')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const unselectedTags = adminTags.filter((t) => !lead.tags.includes(t.name))
  const hasUnsavedChanges = notes !== (lead.notes || '')

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

      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
          <Bot className="w-3 h-3" /> AI Insights
        </div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold">Resumo & Qualificação</h4>
          <span className="text-lg font-bold text-primary mr-24">{lead.aiScore || 0}/100</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {lead.aiSummary ||
            'Nenhum resumo gerado pela IA. A IA analisará as conversas automaticamente em segundo plano.'}
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex flex-row justify-between items-center">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-muted-foreground" />
            Notas de Qualificação
          </h4>
          {hasUnsavedChanges && (
            <Button onClick={handleSaveNotes} disabled={isSaving} size="sm" className="h-7 text-xs">
              {isSaving && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
              Salvar Notas
            </Button>
          )}
        </div>
        <textarea
          className="w-full min-h-[150px] p-3 text-sm rounded-md border bg-muted/30 focus:bg-background focus:ring-2 ring-primary outline-none transition-all resize-none shadow-sm"
          placeholder="Escreva aqui suas observações sobre este lead..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Tags Ativas</h4>
        <div className="flex flex-wrap gap-2 items-center">
          {lead.tags.map((tag) => {
            const tagDef = adminTags.find((t) => t.name === tag)
            return (
              <Badge
                key={tag}
                variant="secondary"
                className="pl-3 pr-1.5 py-1 flex items-center gap-1 group"
                style={{
                  backgroundColor: tagDef ? `${tagDef.color}20` : undefined,
                  color: tagDef ? tagDef.color : undefined,
                  border: tagDef ? `1px solid ${tagDef.color}40` : undefined,
                }}
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTagFromLead(lead.id, tag)}
                  className="rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all focus:outline-none"
                  title="Remover tag"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )
          })}

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Badge
                variant="outline"
                className="px-3 py-1 border-dashed cursor-pointer hover:bg-muted transition-colors"
              >
                + Add Tag
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar tag..." />
                <CommandList>
                  <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
                  <CommandGroup>
                    {unselectedTags.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        onSelect={() => {
                          addTagToLead(lead.id, tag.name)
                          setOpen(false)
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-2 shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
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
