import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  FileText,
  Download as DownloadIcon,
} from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClientStore } from '@/stores/useClientStore'
import { Client } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

export default function Clients() {
  const { clients, addClient } = useClientStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    status: 'Lead',
  })

  const handleSave = () => {
    if (!formData.name || !formData.cpf || !formData.phone) {
      toast.error('Preencha os campos obrigatórios (Nome, CPF e Telefone).')
      return
    }

    const newClient: Client = {
      id: `c_${Date.now()}`,
      ...formData,
      date: new Date().toLocaleDateString('pt-BR'),
      documents: [],
    }

    addClient(newClient)
    setIsDialogOpen(false)
    setFormData({ name: '', cpf: '', email: '', phone: '', status: 'Lead' })
    toast.success('Cliente cadastrado com sucesso!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cliente Ativo':
        return 'bg-success/10 text-success border-success/20'
      case 'Lead Quente':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'Inativo':
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes e Leads</h1>
          <p className="text-muted-foreground">Gerencie sua base de contatos e documentações.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                <Plus className="w-4 h-4" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>CPF *</Label>
                    <Input
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Telefone *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: maskPhone(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status Atual</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead Novo">Lead Novo</SelectItem>
                      <SelectItem value="Lead Quente">Lead Quente</SelectItem>
                      <SelectItem value="Cliente Ativo">Cliente Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-slate-900">
                  Salvar Cliente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, CPF ou email..." className="pl-8" />
          </div>
          <Button variant="secondary" className="gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nome / E-mail</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {client.email || 'Sem e-mail'}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{client.cpf || '-'}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(client.status)}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{client.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedClient(client)}>
                      Ver Perfil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent className="sm:max-w-[650px] min-h-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedClient?.name}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="perfil" className="w-full mt-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="perfil">Perfil do Cliente</TabsTrigger>
              <TabsTrigger value="documentos">
                Documentação
                {selectedClient?.documents && selectedClient.documents.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0.5">
                    {selectedClient.documents.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="perfil" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-card">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">E-mail</Label>
                  <p className="font-medium">{selectedClient?.email || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Telefone</Label>
                  <p className="font-medium">{selectedClient?.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">CPF</Label>
                  <p className="font-medium">{selectedClient?.cpf || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Status</Label>
                  <p className="font-medium">{selectedClient?.status}</p>
                </div>
                {selectedClient?.city && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Cidade/UF</Label>
                    <p className="font-medium">{selectedClient.city}</p>
                  </div>
                )}
                {selectedClient?.benefitType && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">
                      Benefício Desejado
                    </Label>
                    <p className="font-medium">{selectedClient.benefitType}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documentos" className="py-4">
              {!selectedClient?.documents || selectedClient.documents.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Nenhum documento anexado.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Arquivo</TableHead>
                        <TableHead className="w-[100px]">Tamanho</TableHead>
                        <TableHead className="text-right w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClient.documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-2 max-w-[250px]">
                              <FileText className="w-4 h-4 text-primary shrink-0" />
                              <span className="truncate text-sm font-medium" title={doc.name}>
                                {doc.name}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(doc.uploadDate), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatBytes(doc.size)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Eye className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={doc.url} download={doc.name}>
                                <DownloadIcon className="w-4 h-4" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
