import React, { useState } from 'react'
import { MoreVertical, Edit, Trash2, Loader2, Copy } from 'lucide-react'
import { Lead } from '@/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'
import { toast } from 'sonner'

export function LeadActions({ lead }: { lead: Lead }) {
  const { editLead, deleteLead, duplicateLead } = useLeadStore()
  const { pipelineStages, benefitTypes, pipelines } = useAdminStore()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [data, setData] = useState<Partial<Lead>>({})
  const [loading, setLoading] = useState(false)

  const [dupPipeline, setDupPipeline] = useState('')
  const [dupStage, setDupStage] = useState('')

  const handleEdit = () => {
    setData({ ...lead, heat: lead.heat || 'Morno' })
    setEditOpen(true)
  }

  const handleSave = async () => {
    if (!data.name) return toast.error('Nome é obrigatório')
    setLoading(true)
    try {
      await editLead(lead.id, data)
      toast.success('Lead atualizado com sucesso!')
      setEditOpen(false)
    } catch (e: any) {
      toast.error(e.message || 'Erro ao atualizar o lead')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteLead(lead.id)
      toast.success('Lead excluído com sucesso!')
      setDeleteOpen(false)
    } catch (e: any) {
      toast.error(e.message || 'Erro ao excluir o lead')
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async () => {
    setLoading(true)
    try {
      await duplicateLead(lead.id, dupPipeline, dupStage)
      setDuplicateOpen(false)
      setDupPipeline('')
      setDupStage('')
    } catch (e: any) {
      toast.error(e.message || 'Erro ao duplicar o lead')
    } finally {
      setLoading(false)
    }
  }

  const stages = pipelineStages.filter((s) => s.pipelineId === lead.pipelineId)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar Lead
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDuplicateOpen(true)}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicar Lead
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Nome *</Label>
              <Input
                value={data.name || ''}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={data.email || ''}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Telefone</Label>
              <Input
                value={data.phone || ''}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Cidade</Label>
              <Input
                value={data.city || ''}
                onChange={(e) => setData({ ...data, city: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Etapa</Label>
              <Select
                value={data.stage || ''}
                onValueChange={(v) => setData({ ...data, stage: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Benefício</Label>
              <Select
                value={data.benefitType || ''}
                onValueChange={(v) => setData({ ...data, benefitType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {benefitTypes.map((b) => (
                    <SelectItem key={b.id} value={b.name}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Responsável</Label>
              <Input
                value={data.assignee || ''}
                onChange={(e) => setData({ ...data, assignee: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Temperatura</Label>
              <Select
                value={data.heat || 'Morno'}
                onValueChange={(v: any) => setData({ ...data, heat: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Frio">Frio</SelectItem>
                  <SelectItem value="Morno">Morno</SelectItem>
                  <SelectItem value="Quente">Quente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading || !data.name}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Duplicar Lead</DialogTitle>
            <DialogDescription>
              Escolha o Pipeline e a Etapa para onde este lead será duplicado. Os dados como nome,
              contato, notas e tags serão sincronizados automaticamente entre os leads.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pipeline de Destino</Label>
              <Select
                value={dupPipeline}
                onValueChange={(v) => {
                  setDupPipeline(v)
                  setDupStage('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pipeline..." />
                </SelectTrigger>
                <SelectContent>
                  {pipelines.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Etapa</Label>
              <Select value={dupStage} onValueChange={setDupStage} disabled={!dupPipeline}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma etapa..." />
                </SelectTrigger>
                <SelectContent>
                  {pipelineStages
                    .filter((s) => s.pipelineId === dupPipeline)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleDuplicate} disabled={loading || !dupPipeline || !dupStage}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Duplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita. (Leads
              duplicados não serão excluídos, apenas esta instância).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
