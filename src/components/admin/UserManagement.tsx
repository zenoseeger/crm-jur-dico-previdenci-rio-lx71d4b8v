import React, { useState } from 'react'
import { useAuthStore, RegisteredUser } from '@/stores/useAuthStore'
import { UserRole } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit2, Trash2, Plus, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

export function UserManagement() {
  const { users, adminCreateUser, adminUpdateUser, adminDeleteUser } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'SDR' as UserRole,
    password: '',
    confirmPassword: '',
  })

  const handleOpenDialog = (user?: RegisteredUser) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        password: '',
        confirmPassword: '',
      })
    } else {
      setEditingUser(null)
      setFormData({ name: '', email: '', role: 'SDR', password: '', confirmPassword: '' })
    }
    setIsOpen(true)
  }

  const handleSubmit = async () => {
    const cleanEmail = formData.email.trim().toLowerCase()

    if (!formData.name.trim() || !cleanEmail) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }

    if (!editingUser && !formData.password) {
      toast.error('A senha é obrigatória para novos usuários.')
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      if (editingUser) {
        const payload: any = {
          name: formData.name.trim(),
          email: cleanEmail,
          role: formData.role,
        }
        if (formData.password) {
          payload.password = formData.password
        }
        await adminUpdateUser(editingUser.id, payload)
      } else {
        await adminCreateUser({
          name: formData.name.trim(),
          email: cleanEmail,
          role: formData.role,
          password: formData.password,
        })
      }
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro ao salvar o usuário.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      await adminDeleteUser(id)
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestão de Equipe</CardTitle>
          <CardDescription>Gerencie os acessos, senhas e permissões do sistema.</CardDescription>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Usuário
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {editingUser ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha *'}
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {(formData.password || !editingUser) && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Confirmar Senha *</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Nível de Acesso *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) => setFormData({ ...formData, role: val as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Administrador</SelectItem>
                    <SelectItem value="Usuário">Usuário Padrão</SelectItem>
                    <SelectItem value="SDR">SDR (Pré-vendas)</SelectItem>
                    <SelectItem value="Closer">Closer (Vendas)</SelectItem>
                    <SelectItem value="Advogado">Advogado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-slate-900 text-white" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Data de Registro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      u.role === 'Admin'
                        ? 'border-amber-500 text-amber-700 dark:text-amber-500 bg-amber-500/10'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }
                  >
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {u.createdAt
                    ? format(new Date(u.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })
                    : '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(u)}>
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
