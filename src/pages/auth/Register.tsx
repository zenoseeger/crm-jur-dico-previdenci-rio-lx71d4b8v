import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Scale, Loader2 } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuthStore()

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos.')
      return
    }

    const hasLetters = /[a-zA-Z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)

    if (password.length < 8 || !hasLetters || !hasNumbers) {
      toast.error('A senha deve ter no mínimo 8 caracteres e incluir letras e números.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password)
      toast.success('Conta criada com sucesso!')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(
        err.message === 'Email already registered.' ? 'Este e-mail já está em uso.' : err.message,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50 animate-fade-in-up">
        <CardHeader className="space-y-3 items-center text-center">
          <div className="bg-slate-900 text-amber-500 p-3 rounded-xl flex-shrink-0 shadow-sm">
            <Scale className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Criar Conta</CardTitle>
          <CardDescription>Registre-se para acessar o CRM Jurídico</CardDescription>
        </CardHeader>

        <form onSubmit={handleRegisterSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Dr. João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="advogado@escritorio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 8 caracteres, com letras e números.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Cadastrar
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Já tenho uma conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-slate-900 dark:text-white hover:underline"
              >
                Entrar
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
