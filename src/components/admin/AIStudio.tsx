import React, { useState, useEffect } from 'react'
import { useAdminStore } from '@/stores/useAdminStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Save, Send, Sparkles, RefreshCcw, Eye, EyeOff, KeyRound, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function AIStudio() {
  const { aiConfig, updateAIConfig } = useAdminStore()
  const [formData, setFormData] = useState({
    ...aiConfig,
    responseDelay: aiConfig.responseDelay || 0,
    fragmentMessages: aiConfig.fragmentMessages || false,
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [chat, setChat] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    {
      role: 'ai',
      text: 'Olá! Sou o assistente no ambiente de teste. Como posso ajudar com a triagem previdenciária hoje?',
    },
  ])
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sandboxTriggered, setSandboxTriggered] = useState(false)

  useEffect(() => {
    setFormData({
      ...aiConfig,
      responseDelay: aiConfig.responseDelay || 0,
      fragmentMessages: aiConfig.fragmentMessages || false,
    })
  }, [aiConfig])

  const handleSave = () => {
    if (!formData.apiKey.trim()) {
      toast.error('A API Key da OpenAI é obrigatória.')
      return
    }
    if (formData.triggerMode === 'keyword' && !formData.triggerKeyword.trim()) {
      toast.error('Informe a palavra-chave para o gatilho.')
      return
    }
    updateAIConfig(formData)
    toast.success('Configurações de IA salvas com sucesso!')
  }

  const handleSend = () => {
    if (!message.trim()) return
    const userMsg = message
    setChat((prev) => [...prev, { role: 'user', text: userMsg }])
    setMessage('')

    if (!formData.enabled) {
      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          {
            role: 'ai',
            text: '⚠️ O Agente de IA está desativado globalmente. Nenhuma resposta será gerada automaticamente.',
          },
        ])
      }, 500)
      return
    }

    let shouldTrigger = false
    if (formData.triggerMode === 'always' || sandboxTriggered) {
      shouldTrigger = true
    } else if (formData.triggerMode === 'keyword') {
      const msgText = userMsg.toLowerCase()
      const kw = formData.triggerKeyword.toLowerCase()
      if (formData.triggerCondition === 'equals' && msgText.trim() === kw.trim()) {
        shouldTrigger = true
      } else if (formData.triggerCondition === 'contains' && msgText.includes(kw)) {
        shouldTrigger = true
      }
    }

    if (!shouldTrigger) {
      return // Silently wait for keyword
    }

    if (!sandboxTriggered) setSandboxTriggered(true)

    setIsTyping(true)

    if (formData.apiKey && formData.apiKey.startsWith('sk-')) {
      const runAi = async () => {
        try {
          const sysPrompt =
            formData.prompt ||
            'Respond as the assistant directly to the user. Do not include analysis, summaries of previous messages, or descriptions of your strategy in the final output.'
          const history = chat.map((c) => ({
            role: c.role === 'ai' ? 'assistant' : 'user',
            content: c.text,
          }))

          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${formData.apiKey}`,
            },
            body: JSON.stringify({
              model: formData.model || 'gpt-5.4-mini',
              temperature: formData.temperature,
              messages: [
                { role: 'system', content: sysPrompt },
                ...history,
                { role: 'user', content: userMsg },
              ],
            }),
          })

          if (!res.ok) {
            throw new Error('Falha na API da OpenAI')
          }

          const data = await res.json()
          const text = data.choices[0]?.message?.content || 'Sem resposta'

          if (formData.responseDelay > 0) {
            await new Promise((r) => setTimeout(r, formData.responseDelay * 1000))
          }

          if (formData.fragmentMessages) {
            let chunks = text.split(/\n\n+/).filter((c: string) => c.trim().length > 0)
            if (chunks.length === 1) {
              chunks = text.split(/\n+/).filter((c: string) => c.trim().length > 0)
            }
            if (chunks.length === 1) {
              chunks = text.match(/[^.!?]+[.!?]+/g) || [text]
              chunks = chunks.map((c: string) => c.trim()).filter((c: string) => c.length > 0)
            }

            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i]
              setChat((prev) => [...prev, { role: 'ai', text: chunk }])
              if (i < chunks.length - 1) {
                await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 2000) + 1000))
              }
            }
          } else {
            setChat((prev) => [...prev, { role: 'ai', text }])
          }
        } catch (err) {
          setChat((prev) => [
            ...prev,
            {
              role: 'ai',
              text: 'Erro ao se comunicar com a OpenAI. Verifique sua chave e conexão.',
            },
          ])
        } finally {
          setIsTyping(false)
        }
      }
      runAi()
    } else {
      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          {
            role: 'ai',
            text: `Esta é uma resposta de demonstração direta. Configure sua API Key no painel para testar interações reais com o modelo ${formData.model}.`,
          },
        ])
        setIsTyping(false)
      }, 1500)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-7 border-slate-200 shadow-sm flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle>Configurações de IA</CardTitle>
            <CardDescription>
              Ajuste credenciais, regras de ativação e contexto global.
            </CardDescription>
          </div>
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-lg border transition-colors shadow-inner',
              !formData.enabled
                ? 'bg-destructive/10 border-destructive/30'
                : 'bg-muted/50 border-border/50',
            )}
          >
            <Label
              htmlFor="global-ai-disable"
              className={cn(
                'cursor-pointer font-semibold text-sm',
                !formData.enabled && 'text-destructive',
              )}
            >
              Desativar Agente
            </Label>
            <Switch
              id="global-ai-disable"
              checked={!formData.enabled}
              onCheckedChange={(val) => setFormData({ ...formData, enabled: !val })}
              className="data-[state=checked]:bg-destructive"
              title="Kill-switch global da IA"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                OpenAI API Key <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Modelo de IA</Label>
                <Select
                  value={formData.model}
                  onValueChange={(val) => setFormData({ ...formData, model: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-5.4-mini">gpt-5.4-mini</SelectItem>
                    <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                    <SelectItem value="o1-preview">o1-preview</SelectItem>
                    <SelectItem value="o1-mini">o1-mini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Temperatura: {formData.temperature}</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.temperature > 0.6 ? 'Criativo' : 'Preciso'}
                  </span>
                </div>
                <Slider
                  max={1}
                  min={0}
                  step={0.1}
                  value={[formData.temperature]}
                  onValueChange={([val]) => setFormData({ ...formData, temperature: val })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Label className="text-base">Ritmo da Conversa</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Atraso na Resposta: {formData.responseDelay}s</Label>
                </div>
                <Slider
                  max={60}
                  min={0}
                  step={1}
                  value={[formData.responseDelay]}
                  onValueChange={([val]) => setFormData({ ...formData, responseDelay: val })}
                />
              </div>
              <div className="space-y-2 flex flex-col justify-center">
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg border bg-muted/50 border-border/50">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="fragment-messages">Fragmentar Mensagens</Label>
                    <p className="text-[10px] text-muted-foreground leading-none">
                      Simula o ritmo de digitação humana enviando mensagens curtas em sequência.
                    </p>
                  </div>
                  <Switch
                    id="fragment-messages"
                    checked={formData.fragmentMessages}
                    onCheckedChange={(val) => setFormData({ ...formData, fragmentMessages: val })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-muted-foreground" />
              <Label className="text-base">Regras de Ativação (Gatilho)</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modo de Ativação</Label>
                <Select
                  value={formData.triggerMode}
                  onValueChange={(val: 'always' | 'keyword') =>
                    setFormData({ ...formData, triggerMode: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Sempre Ativo</SelectItem>
                    <SelectItem value="keyword">Por Palavra-chave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.triggerMode === 'keyword' && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Condição da Mensagem</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.triggerCondition}
                      onValueChange={(val: 'contains' | 'equals') =>
                        setFormData({ ...formData, triggerCondition: val })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contém</SelectItem>
                        <SelectItem value="equals">É igual a</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Ex: iniciar"
                      value={formData.triggerKeyword}
                      onChange={(e) => setFormData({ ...formData, triggerKeyword: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>System Prompt (Triage)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs gap-1"
                  onClick={() => setFormData({ ...formData, prompt: aiConfig.prompt })}
                >
                  <RefreshCcw className="w-3 h-3" /> Restaurar
                </Button>
              </div>
              <Textarea
                className="min-h-[120px] font-mono text-sm leading-relaxed bg-slate-50 dark:bg-slate-900"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Prompt de Qualificação (AI Observer)</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Instruções para o observador silencioso gerar o resumo e a nota (0-100) do lead.
              </p>
              <Textarea
                className="min-h-[100px] font-mono text-sm leading-relaxed bg-slate-50 dark:bg-slate-900 resize-none"
                placeholder="Ex: Avalie se o cliente já possui a idade mínima..."
                value={formData.qualificationPrompt || ''}
                onChange={(e) => setFormData({ ...formData, qualificationPrompt: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 justify-end py-4">
          <Button
            onClick={handleSave}
            className="bg-slate-900 gap-2"
            disabled={!formData.apiKey.trim()}
          >
            <Save className="w-4 h-4" /> Salvar Configurações
          </Button>
        </CardFooter>
      </Card>

      <Card className="lg:col-span-5 border-slate-200 shadow-sm flex flex-col h-[700px] lg:h-auto">
        <CardHeader className="bg-slate-900 text-white rounded-t-lg pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Sandbox de Teste
            </div>
            {formData.triggerMode === 'keyword' && !sandboxTriggered && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-full font-medium">
                Aguardando: "{formData.triggerKeyword}"
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-slate-300">
            Simule conversas como se fosse o Lead com a IA real.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col relative overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-4">
              {chat.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex w-full',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap',
                      msg.role === 'user'
                        ? 'bg-amber-500 text-white rounded-tr-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm border border-slate-200 dark:border-slate-700',
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex w-full justify-start animate-fade-in">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 rounded-tl-sm border border-slate-200 dark:border-slate-700 flex gap-1 shadow-sm">
                    <div
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-3 bg-white dark:bg-slate-950 border-t flex gap-2">
            <Input
              placeholder="Digite uma mensagem como Lead..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim() || isTyping}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
