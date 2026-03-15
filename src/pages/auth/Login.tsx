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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { Scale, Loader2, ArrowLeft, MailCheck } from 'lucide-react'

export default function Login() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const { requestLoginCode, verifyLoginCode } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Por favor, insira um e-mail válido.')
      return
    }

    setLoading(true)
    try {
      await requestLoginCode(email)
      toast.success('Código enviado! Verifique seu e-mail.')
      setStep('otp')
    } catch (err: any) {
      toast.error(err.message)
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
      await verifyLoginCode(email, otp)
      toast.success('Acesso autorizado com sucesso!')
      navigate(from, { replace: true })
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
      await requestLoginCode(email)
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
            {step === 'email' ? <Scale className="w-8 h-8" /> : <MailCheck className="w-8 h-8" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {step === 'email' ? 'Acesso Seguro' : 'Verificação de Segurança'}
          </CardTitle>
          <CardDescription>
            {step === 'email'
              ? 'Insira seu e-mail para receber um código de acesso.'
              : `Enviamos um código de 6 dígitos para o e-mail: ${email}`}
          </CardDescription>
        </CardHeader>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail Profissional</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="advogado@escritorio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                disabled={loading || !email.includes('@')}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Continuar
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
                  onClick={() => setStep('email')}
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
