import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    // Do not log if the path is literally a wildcard to avoid console spam during layout redirects
    if (location.pathname !== '/*') {
      console.error('404 Error: User attempted to access non-existent route:', location.pathname)
    }
  }, [location.pathname])

  return (
    <div className="h-full min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
        <div className="bg-muted p-4 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight text-slate-900 dark:text-white">
          404
        </h1>
        <p className="text-xl text-muted-foreground mb-8">Página não encontrada</p>
        <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
          <Link to="/">Voltar para o Início</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
