import React, { useState } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Save, Send, Sparkles, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AIStudio() {
  const { aiConfig, updateAIConfig } = useAdminStore()
  const [formData, setFormData] = useState(aiConfig)
  const [chat, setChat] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    {
      role: 'ai',
      text: 'Olá! Sou o assistente no ambiente de teste. Como posso ajudar com a triagem previdenciária hoje?',
    },
  ])
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSave = () => {
    updateAIConfig(formData)
  }

  const handleSend = () => {
    if (!message.trim()) return
    const userMsg = message
    setChat((prev) => [...prev, { role: 'user', text: userMsg }])
    setMessage('')
    setIsTyping(true)

    // Mock AI response
    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Com base no prompt (Modelo: ${formData.model}, Temp: ${formData.temperature}), minha resposta simulada para "${userMsg}" seria focar na coleta de documentos do CNIS.`,
        },
      ])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-7 border-slate-200 shadow-sm flex flex-col">
        <CardHeader>
          <CardTitle>Comportamento da IA</CardTitle>
          <CardDescription>
            Defina as regras, personalidade e parâmetros do modelo de linguagem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex-1">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>System Prompt</Label>
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
              className="min-h-[250px] font-mono text-sm leading-relaxed bg-slate-50 dark:bg-slate-900"
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
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
                  <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Rápido)</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
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
        </CardContent>
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 justify-end py-4">
          <Button onClick={handleSave} className="bg-slate-900 gap-2">
            <Save className="w-4 h-4" /> Salvar Configurações
          </Button>
        </CardFooter>
      </Card>

      <Card className="lg:col-span-5 border-slate-200 shadow-sm flex flex-col h-[600px] lg:h-auto">
        <CardHeader className="bg-slate-900 text-white rounded-t-lg pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Sandbox de Teste
          </CardTitle>
          <CardDescription className="text-slate-300">
            Teste as alterações de prompt em tempo real.
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
                      'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
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
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 rounded-tl-sm border border-slate-200 dark:border-slate-700 flex gap-1">
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
