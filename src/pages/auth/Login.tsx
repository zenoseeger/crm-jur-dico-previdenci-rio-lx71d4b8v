import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Normalize email to prevent trailing spaces and capitalization issues
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !cleanEmail.includes('@') || !password) {
      toast.error('Por favor, preencha todos os campos corretamente.')
      return
    }

    setLoading(true)
    try {
      await login(cleanEmail, password)
      toast.success('Acesso autorizado com sucesso!')

      const fromPath = location.state?.from?.pathname
      let target = '/dashboard'

      // Sanitize target to ensure valid redirection and prevent wildcard navigation errors
      if (
        fromPath &&
        typeof fromPath === 'string' &&
        fromPath !== '/' &&
        fromPath !== '/login' &&
        !fromPath.includes('*')
      ) {
        target = fromPath
      }

      navigate(target, { replace: true })
    } catch (err: any) {
      toast.error(err.message || 'Email ou senha inválidos.')
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
          <CardTitle className="text-2xl font-bold tracking-tight">Acesso Seguro</CardTitle>
          <CardDescription>Insira suas credenciais para acessar o CRM.</CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Profissional</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@escritorio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
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
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              disabled={loading || !email.includes('@') || !password}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Entrar
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="font-semibold text-slate-900 dark:text-white hover:underline"
              >
                Cadastre-se
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
