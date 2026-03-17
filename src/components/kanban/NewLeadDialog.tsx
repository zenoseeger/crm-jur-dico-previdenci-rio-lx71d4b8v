import React, { useState, useEffect, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useLeadStore from '@/stores/useLeadStore'
import { useAdminStore } from '@/stores/useAdminStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useClientStore } from '@/stores/useClientStore'
import { toast } from 'sonner'
import { Lead, DocumentFile } from '@/types'

interface NewLeadDialogProps {
  children: React.ReactNode
}

export function NewLeadDialog({ children }: NewLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { addLead, currentPipelineId } = useLeadStore()
  const { addClient } = useClientStore()
  const { pipelines = [], pipelineStages = [], benefitTypes = [] } = useAdminStore() || {}
  const { users = [] } = useAuthStore() || {}

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [benefitType, setBenefitType] = useState('')
  const [city, setCity] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [stageName, setStageName] = useState('')
  const [saveAsClient, setSaveAsClient] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const currentStages = (pipelineStages || [])
    .filter((s) => s.pipelineId === (currentPipelineId || pipelines?.[0]?.id))
    .sort((a, b) => a.order - b.order)

  useEffect(() => {
    if (open) {
      setName('')
      setPhone('')
      setBenefitType(benefitTypes?.length > 0 ? benefitTypes[0].name : '')
      setCity('')
      setAssigneeId(users?.length > 0 ? users[0].id : '')
      setStageName(currentStages.length > 0 ? currentStages[0].name : 'NOVO LEAD')
      setSaveAsClient(false)
      setFiles([])
    }
  }, [open, users, benefitTypes, currentStages.length])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 11) val = val.slice(0, 11)
    if (val.length > 2 && val.length <= 7) val = `(${val.slice(0, 2)}) ${val.slice(2)}`
    else if (val.length > 7) val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`
    setPhone(val)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
  }

  const handleSave = () => {
    if (!name.trim() || phone.replace(/\D/g, '').length < 10) return
    const pipelineId = currentPipelineId || pipelines?.[0]?.id
    const assignee = (users || []).find((u) => u.id === assigneeId)?.name || ''
    const leadId = `l_${Date.now()}`

    const uploadedDocs: DocumentFile[] = files.map((f) => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      leadId,
      name: f.name,
      size: f.size,
      type: f.type,
      uploadDate: new Date().toISOString(),
      url: URL.createObjectURL(f),
    }))

    const newLead: Lead = {
      id: leadId,
      name: name.trim(),
      phone,
      pipelineId,
      stage: stageName || 'NOVO LEAD',
      heat: 'Morno',
      tags: [],
      timeInStage: '0m',
      unread: true,
      benefitType,
      city: city.trim(),
      assignee,
      aiScore: 0,
      createdAt: new Date().toISOString(),
      documents: uploadedDocs,
    }

    addLead(newLead)

    if (saveAsClient) {
      addClient({
        id: `c_${Date.now()}`,
        name: newLead.name,
        phone: newLead.phone,
        status: 'Lead Novo',
        date: new Date().toLocaleDateString('pt-BR'),
        city: newLead.city,
        benefitType: newLead.benefitType,
        documents: uploadedDocs.map((d) => ({
          ...d,
          leadId: undefined,
          clientId: `c_${Date.now()}`,
        })),
      })
      toast.success('Lead e Cliente cadastrados com sucesso!')
    } else {
      toast.success('Lead cadastrado com sucesso!')
    }

    setOpen(false)
  }

  const isValid =
    name.trim().length > 0 && phone.replace(/\D/g, '').length >= 10 && benefitType !== ''

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
          <DialogDescription>
            Cadastre um novo lead manualmente e anexe documentação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Telefone <span className="text-destructive">*</span>
              </Label>
              <Input
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Produto / Benefício <span className="text-destructive">*</span>
              </Label>
              <Select value={benefitType} onValueChange={setBenefitType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {(benefitTypes || []).map((bt) => (
                    <SelectItem key={bt.id} value={bt.name}>
                      {bt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cidade/UF</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo, SP"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Etapa do Pipeline</Label>
              <Select value={stageName} onValueChange={setStageName}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent>
                  {currentStages.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {(users || []).map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 border p-4 rounded-md bg-muted/20">
            <div className="flex items-center justify-between">
              <Label>Documentação</Label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" /> Anexar
              </Button>
            </div>
            {files.length > 0 && (
              <div className="space-y-2 mt-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm bg-background p-2 rounded border"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Switch id="save-client" checked={saveAsClient} onCheckedChange={setSaveAsClient} />
            <Label htmlFor="save-client" className="cursor-pointer">
              Salvar em Clientes
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
