import React, { useState, useEffect } from 'react'
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { Scale, Loader2, MailCheck, ArrowLeft } from 'lucide-react'

export default function Register() {
  const location = useLocation()
  const navigate = useNavigate()

  const [step, setStep] = useState<'form' | 'otp'>(location.state?.step || 'form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, verifyRegistration, resendRegistrationCode } = useAuthStore()

  useEffect(() => {
    if (location.state?.step) {
      setStep(location.state.step)
    }
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location.state])

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
      toast.success('Conta criada! Verifique seu e-mail.')
      setStep('otp')
    } catch (err: any) {
      toast.error(
        err.message === 'Email already registered.' ? 'Este e-mail já está em uso.' : err.message,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('O código deve conter 6 dígitos.')
      return
    }

    setLoading(true)
    try {
      await verifyRegistration(email, otp)
      toast.success('Conta verificada e ativada com sucesso!')
      navigate('/')
    } catch (err: any) {
      toast.error(err.message)
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    try {
      await resendRegistrationCode(email)
      toast.success('Novo código enviado com sucesso!')
      setOtp('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50 animate-fade-in-up">
        <CardHeader className="space-y-3 items-center text-center">
          <div className="bg-slate-900 text-amber-500 p-3 rounded-xl flex-shrink-0 shadow-sm">
            {step === 'form' ? <Scale className="w-8 h-8" /> : <MailCheck className="w-8 h-8" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {step === 'form' ? 'Criar Conta' : 'Verifique seu E-mail'}
          </CardTitle>
          <CardDescription>
            {step === 'form'
              ? 'Registre-se para acessar o CRM Jurídico'
              : `Enviamos um código de 6 dígitos para o e-mail: ${email}`}
          </CardDescription>
        </CardHeader>

        {step === 'form' ? (
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
                Já possui uma conta?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-slate-900 dark:text-white hover:underline"
                >
                  Faça Login
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="space-y-2 text-center w-full">
                <Label htmlFor="otp" className="text-sm font-medium text-center block mb-4">
                  Digite o código de verificação
                  <span className="block mt-1 text-xs text-muted-foreground font-normal">
                    Para testes, use o código: <strong className="text-foreground">123456</strong>
                  </span>
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    id="otp"
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                disabled={loading || otp.length !== 6}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Verificar Código
              </Button>
              <div className="flex w-full justify-between items-center text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setStep('form')}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="font-semibold text-slate-900 dark:text-white"
                  onClick={handleResendCode}
                  disabled={loading}
                >
                  Reenviar Código
                </Button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
