import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Settings() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações & Automação</h1>
        <p className="text-muted-foreground">
          Ajuste regras de IA, gatilhos do WhatsApp e gestão de usuários.
        </p>
      </div>

      <Tabs defaultValue="automations">
        <TabsList className="mb-4">
          <TabsTrigger value="automations">Automações do WhatsApp</TabsTrigger>
          <TabsTrigger value="tags">Gestão de Tags</TabsTrigger>
          <TabsTrigger value="system">Regras do Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cadência: Aguardando Documentos</CardTitle>
              <CardDescription>
                Esta sequência dispara quando a tag "Aguardando Doc" é adicionada. É cancelada se o
                lead responder.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Mensagem Dia 1 (+24h)</p>
                  <p className="text-xs text-muted-foreground">
                    "Olá! Vi que ainda faltam alguns documentos..."
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Mensagem Dia 3 (+72h)</p>
                  <p className="text-xs text-muted-foreground">
                    "Tudo bem? Precisando de ajuda para emitir o CNIS?"
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="outline" size="sm">
                + Adicionar Etapa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Horário de Atendimento da IA</CardTitle>
              <CardDescription>A IA só interage com novos leads nestes horários.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="flex flex-col space-y-1">
                  <span>Atender finais de semana</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Se ativo, a IA enviará o fluxo inicial no sábado e domingo.
                  </span>
                </Label>
                <Switch />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input type="time" defaultValue="19:00" />
                </div>
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Interface CRUD de Tags em construção...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
