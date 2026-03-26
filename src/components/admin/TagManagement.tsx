import React, { useState } from 'react'
import { useAdminStore } from '@/stores/useAdminStore'
import { TagDef, TagCategory } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit2, Trash2, Plus, Tag as TagIcon, Loader2 } from 'lucide-react'

const CATEGORIES: TagCategory[] = [
  'Tipo de Benefício',
  'Status de Documentação',
  'Qualificação',
  'Follow-up',
]

export function TagManagement() {
  const { tags, addTag, updateTag, deleteTag } = useAdminStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagDef | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    category: 'Qualificação' as TagCategory,
  })

  const handleOpenDialog = (tag?: TagDef) => {
    if (tag) {
      setEditingTag(tag)
      setFormData({ name: tag.name, color: tag.color, category: tag.category })
    } else {
      setEditingTag(null)
      setFormData({ name: '', color: '#3b82f6', category: 'Qualificação' })
    }
    setIsOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('O nome da tag é obrigatório.')
      return
    }

    setLoading(true)
    try {
      if (editingTag) {
        await updateTag(editingTag.id, { ...formData, name: formData.name.trim() })
      } else {
        await addTag({ ...formData, name: formData.name.trim() })
      }
      setIsOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tag?')) {
      await deleteTag(id)
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestão de Tags</CardTitle>
          <CardDescription>Crie e organize marcadores para qualificar os leads.</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTag ? 'Editar Tag' : 'Criar Tag'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Tag</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Urgente"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                  <Label>Cor (Hex)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      className="w-12 h-10 p-1 cursor-pointer"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                    <Input
                      className="flex-1"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) =>
                      setFormData({ ...formData, category: val as TagCategory })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border"
                  style={{
                    borderColor: `${formData.color}50`,
                    backgroundColor: `${formData.color}10`,
                    color: formData.color,
                  }}
                >
                  <TagIcon className="w-3 h-3" /> {formData.name || 'Nome da Tag'}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-slate-900"
                disabled={loading || !formData.name.trim()}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  <div
                    className="w-4 h-4 rounded-full shadow-sm border border-black/10"
                    style={{ backgroundColor: tag.color }}
                  />
                </TableCell>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{tag.category}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(tag)}>
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tags.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Nenhuma tag cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
