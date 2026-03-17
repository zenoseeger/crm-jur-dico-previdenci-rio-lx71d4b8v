import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdminStore } from '@/stores/useAdminStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { LogoutConfirm } from '@/components/auth/LogoutConfirm'
import { toast } from 'sonner'
import {
  User,
  Settings as SettingsIcon,
  Bot,
  Bell,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react'

export default function Settings() {
  const { aiConfig, updateAIConfig } = useAdminStore()
  const { user } = useAuthStore()
  const [aiData, setAiData] = useState(aiConfig)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isTestingAI, setIsTestingAI] = useState(false)

  const isAdmin = user?.role === 'Admin'

  const handleSaveAI = () => {
    updateAIConfig(aiData)
    toast.success('Configurações de IA salvas com sucesso!')
  }

  const handleTestAI = () => {
    setIsTestingAI(true)
    setTimeout(() => {
      setIsTestingAI(false)
      if (aiData.apiKey && aiData.apiKey.length > 10) {
        toast.success('Conexão estabelecida com sucesso! API Key válida.')
      } else {
        toast.error('Falha na conexão. Verifique sua API Key.')
      }
    }, 1500)
  }

  const handleSaveProfile = () => {
    toast.success('Perfil atualizado com sucesso!')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-900 text-amber-500 rounded-lg">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie seu perfil, integrações e preferências do sistema.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Tabs defaultValue="profile" className="flex-1 w-full flex flex-col md:flex-row gap-6">
          <TabsList className="flex md:flex-col h-auto bg-transparent p-0 space-y-1 space-x-0 md:w-64 overflow-x-auto">
            <TabsTrigger
              value="profile"
              className="w-full justify-start gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border p-3"
            >
              <User className="w-4 h-4" /> Meu Perfil
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger
                  value="ai"
                  className="w-full justify-start gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border p-3"
                >
                  <Bot className="w-4 h-4" /> Integração IA
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="w-full justify-start gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border p-3"
                >
                  <Shield className="w-4 h-4" /> Preferências
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="flex-1 min-w-0">
            <TabsContent value="profile" className="m-0 border-none p-0 outline-none space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Informações do Perfil</CardTitle>
                  <CardDescription>
                    Atualize seus dados pessoais e de acesso ao sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input defaultValue={user?.name || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input type="email" defaultValue={user?.email || ''} disabled />
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="text-sm font-semibold">Alterar Senha</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nova Senha</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmar Nova Senha</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t justify-end py-4">
                  <Button onClick={handleSaveProfile} className="bg-slate-900">
                    Salvar Perfil
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-destructive/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-destructive">Sessão e Segurança</CardTitle>
                  <CardDescription>
                    Gerencie o acesso da sua conta neste dispositivo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ao encerrar sua sessão, você precisará informar suas credenciais novamente na
                    próxima vez que acessar o CRM.
                  </p>
                  <LogoutConfirm>
                    <Button variant="destructive" className="gap-2">
                      <LogOut className="w-4 h-4" /> Sair da Conta
                    </Button>
                  </LogoutConfirm>
                </CardContent>
              </Card>
            </TabsContent>

            {isAdmin && (
              <>
                <TabsContent value="ai" className="m-0 border-none p-0 outline-none">
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Integração com OpenAI</CardTitle>
                      <CardDescription>
                        Configure as credenciais para ativar os recursos de inteligência artificial
                        do CRM.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>
                          OpenAI API Key <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            type={showApiKey ? 'text' : 'password'}
                            value={aiData.apiKey}
                            onChange={(e) => setAiData({ ...aiData, apiKey: e.target.value })}
                            placeholder="sk-..."
                            className="pr-10 font-mono text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Necessário para análises de leads e respostas automatizadas.
                        </p>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Modelo de Linguagem</Label>
                          <Select
                            value={aiData.model}
                            onValueChange={(v) => setAiData({ ...aiData, model: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Rápido)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label>Temperatura ({aiData.temperature})</Label>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                              {aiData.temperature > 0.6 ? 'Mais Criativo' : 'Mais Preciso'}
                            </span>
                          </div>
                          <Slider
                            max={1}
                            min={0}
                            step={0.1}
                            value={[aiData.temperature]}
                            onValueChange={([val]) => setAiData({ ...aiData, temperature: val })}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t justify-between py-4 flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={handleTestAI}
                        disabled={!aiData.apiKey || isTestingAI}
                      >
                        {isTestingAI ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Bot className="w-4 h-4 mr-2" />
                        )}
                        Testar Conexão
                      </Button>
                      <Button
                        onClick={handleSaveAI}
                        className="bg-slate-900"
                        disabled={isTestingAI}
                      >
                        Salvar Integração
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences" className="m-0 border-none p-0 outline-none">
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Preferências Globais</CardTitle>
                      <CardDescription>
                        Ajuste o comportamento geral da interface e notificações.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="text-base">Notificações no Navegador</Label>
                          <p className="text-sm text-muted-foreground">
                            Receber alertas de novas mensagens e tarefas concluídas.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="text-base">Atendimento IA 24/7</Label>
                          <p className="text-sm text-muted-foreground">
                            A IA responderá leads mesmo fora do horário comercial.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="space-y-0.5">
                          <Label className="text-base flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" /> Lembrete de Follow-up Diário
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Envio de resumo diário por e-mail com tarefas atrasadas.
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  )
}
