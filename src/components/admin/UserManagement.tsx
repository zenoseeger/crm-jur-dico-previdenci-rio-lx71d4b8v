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
import { Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function UserManagement() {
  const { users, adminUpdateUser, adminDeleteUser } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Usuário' as UserRole,
    passwordHash: '',
  })

  const handleOpenDialog = (user: RegisteredUser) => {
    setEditingUser(user)
    setFormData({ name: user.name, email: user.email, role: user.role, passwordHash: '' })
    setIsOpen(true)
  }

  const handleSubmit = () => {
    if (editingUser) {
      const payload: Partial<RegisteredUser> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }
      if (formData.passwordHash.trim()) {
        payload.passwordHash = formData.passwordHash.trim()
      }
      adminUpdateUser(editingUser.id, payload)
    }
    setIsOpen(false)
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestão de Equipe</CardTitle>
          <CardDescription>Gerencie os acessos, senhas e permissões do sistema.</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nova Senha (deixe em branco para não alterar)</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.passwordHash}
                  onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Função (Nível de Acesso)</Label>
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
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-slate-900 text-white">
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.role === 'Admin'
                        ? 'border-amber-500 text-amber-700 dark:text-amber-500 bg-amber-500/10'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.createdAt
                    ? format(new Date(user.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })
                    : '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => adminDeleteUser(user.id)}>
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
