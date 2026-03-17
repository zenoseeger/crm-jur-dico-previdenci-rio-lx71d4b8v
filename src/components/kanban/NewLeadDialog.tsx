import React, { useState, useEffect } from 'react'
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
import { Lead } from '@/types'

const BENEFIT_TYPES = [
  'Aposentadoria por Idade',
  'Aposentadoria Rural',
  'BPC/LOAS',
  'Pensão por Morte',
  'Auxílio Doença',
  'Outros',
]

interface NewLeadDialogProps {
  children: React.ReactNode
}

export function NewLeadDialog({ children }: NewLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const { addLead, currentPipelineId } = useLeadStore()
  const { users, pipelines, pipelineStages } = useAdminStore()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [benefitType, setBenefitType] = useState(BENEFIT_TYPES[0])
  const [city, setCity] = useState('')
  const [assigneeId, setAssigneeId] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setPhone('')
      setBenefitType(BENEFIT_TYPES[0])
      setCity('')
      setAssigneeId(users.length > 0 ? users[0].id : '')
    }
  }, [open, users])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 11) val = val.slice(0, 11)
    if (val.length > 2 && val.length <= 7) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`
    } else if (val.length > 7) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`
    }
    setPhone(val)
  }

  const handleSave = () => {
    if (!name.trim() || phone.replace(/\D/g, '').length < 10) return

    const pipelineId = currentPipelineId || pipelines[0]?.id
    const sortedStages = pipelineStages
      .filter((s) => s.pipelineId === pipelineId)
      .sort((a, b) => a.order - b.order)

    const stage = sortedStages.length > 0 ? sortedStages[0].name : 'NOVO LEAD'
    const assignee = users.find((u) => u.id === assigneeId)?.name || ''

    const newLead: Lead = {
      id: `l_${Date.now()}`,
      name: name.trim(),
      phone,
      pipelineId,
      stage,
      heat: 'Morno',
      tags: [],
      timeInStage: '0m',
      unread: true,
      benefitType,
      city: city.trim(),
      assignee,
      aiScore: 0,
      createdAt: new Date().toISOString(),
    }

    addLead(newLead)
    toast.success('Lead cadastrado com sucesso!')
    setOpen(false)
  }

  const isPhoneValid = phone.replace(/\D/g, '').length >= 10
  const isValid = name.trim().length > 0 && isPhoneValid

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
          <DialogDescription>
            Cadastre um novo lead manualmente. Ele será adicionado na primeira etapa do pipeline
            atual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome Completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade/UF</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo, SP"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Benefício</Label>
              <Select value={benefitType} onValueChange={setBenefitType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {BENEFIT_TYPES.map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {bt}
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
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
