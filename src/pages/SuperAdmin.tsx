import React, { useState } from 'react'
import { Globe, Users, Building2, Plus, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserManagement } from '@/components/admin/UserManagement'
import { useAuthStore } from '@/stores/useAuthStore'
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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

export default function SuperAdmin() {
  const { companies, createCompany } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateCompany = async () => {
    if (!companyName.trim()) {
      toast.error('O nome da empresa é obrigatório.')
      return
    }
    setLoading(true)
    try {
      await createCompany(companyName.trim())
      setIsOpen(false)
      setCompanyName('')
    } catch (e: any) {
      toast.error(e.message || 'Erro ao criar empresa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-900 text-amber-500 rounded-lg">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Painel Global Multi-Empresa
          </h1>
          <p className="text-muted-foreground">
            Gerencie todas as instâncias (tenants) isoladas e usuários da plataforma.
          </p>
        </div>
      </div>

      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg flex-wrap h-auto">
          <TabsTrigger
            value="companies"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-amber-500 gap-2"
          >
            <Building2 className="w-4 h-4" /> Empresas (Tenants)
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-amber-500 gap-2"
          >
            <Users className="w-4 h-4" /> Todos os Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="m-0">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Empresas Cadastradas</CardTitle>
                <CardDescription>
                  Visualize e crie novos ambientes isolados para clientes.
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsOpen(true)}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" /> Nova Empresa
              </Button>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Empresa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nome Fantasia</Label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Clínica Sorria Mais"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateCompany}
                      className="bg-slate-900 text-white"
                      disabled={loading}
                    >
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
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">ID Interno</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-success/10 text-success border-success/20"
                        >
                          {c.status === 'active' ? 'Ativa' : c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {c.createdAt
                          ? format(new Date(c.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {c.id.split('-')[0]}...
                      </TableCell>
                    </TableRow>
                  ))}
                  {companies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Nenhuma empresa encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="m-0">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
