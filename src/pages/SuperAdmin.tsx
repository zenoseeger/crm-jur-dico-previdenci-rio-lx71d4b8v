import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'
import { Building2, Plus, ArrowRight, Loader2, Users } from 'lucide-react'
import { format } from 'date-fns'

export default function SuperAdmin() {
  const { user } = useAuthStore()
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      const { data: profiles } = await supabase.from('profiles').select('company_id')
      const counts = profiles?.reduce((acc: any, p: any) => {
        acc[p.company_id] = (acc[p.company_id] || 0) + 1
        return acc
      }, {})

      setCompanies(data.map((c) => ({ ...c, usersCount: counts?.[c.id] || 0 })))
    } else {
      console.error(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) return
    setCreating(true)

    const newCompanyId = crypto.randomUUID()
    const { error } = await supabase.from('companies').insert({
      id: newCompanyId,
      name: newCompanyName.trim(),
    })

    if (error) {
      toast.error('Erro ao criar empresa')
    } else {
      toast.success('Empresa criada com sucesso!')
      setIsOpen(false)
      setNewCompanyName('')
      fetchCompanies()
    }
    setCreating(false)
  }

  const handleSwitchCompany = async (companyId: string) => {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ company_id: companyId })
      .eq('id', user.id)
    if (error) {
      toast.error('Erro ao mudar de ambiente')
    } else {
      toast.success('Ambiente alterado! Recarregando...')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    }
  }

  if (user?.email !== 'zhseeger@gmail.com') {
    return <div className="p-8 text-center text-red-500">Acesso Negado</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-900 text-amber-500 rounded-lg">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Painel Master Admin
          </h1>
          <p className="text-muted-foreground">
            Gerencie todas as instâncias (empresas) da plataforma SaaS.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle>Empresas Cadastradas</CardTitle>
            <CardDescription>
              Visão geral de todos os inquilinos (tenants) do sistema.
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 text-white hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" /> Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="Ex: Clínica Odontológica Sorriso"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={creating}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCompany}
                  disabled={creating || !newCompanyName.trim()}
                  className="bg-slate-900 text-white"
                >
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Criar Empresa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Empresa</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-4 h-4" /> {c.usersCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(c.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSwitchCompany(c.id)}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        disabled={(user as any)?.companyId === c.id}
                      >
                        {(user as any)?.companyId === c.id ? 'Ativo' : 'Entrar'}{' '}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
