import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface LostLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
}

export function LostLeadDialog({ open, onOpenChange, onConfirm }: LostLeadDialogProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (reason.trim().length > 5) {
      onConfirm(reason)
      setReason('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mover para Perdido</DialogTitle>
          <DialogDescription>
            Por favor, informe o motivo pelo qual este lead foi perdido. Esta informação é
            importante para os relatórios.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Motivo da perda</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Cliente não tem tempo de contribuição suficiente..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={reason.trim().length <= 5}
            variant="destructive"
          >
            Confirmar Perda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
