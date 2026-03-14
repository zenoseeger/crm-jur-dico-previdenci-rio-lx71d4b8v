import React from 'react'
import { Upload, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { MOCK_DOCS } from '@/lib/mockData'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function DocsTab() {
  const docs = MOCK_DOCS
  const completed = docs.filter((d) => d.status === 'ok').length
  const percentage = (completed / docs.length) * 100

  return (
    <div className="space-y-6">
      <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">Progresso do Kit</span>
          <span className="text-muted-foreground font-mono">
            {completed} de {docs.length}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>

      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              {doc.status === 'ok' && <CheckCircle2 className="w-5 h-5 text-success" />}
              {doc.status === 'pending' && <Clock className="w-5 h-5 text-warning" />}
              {doc.status === 'rejected' && <AlertCircle className="w-5 h-5 text-destructive" />}

              <div>
                <p className="text-sm font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {doc.status === 'ok'
                    ? 'Aprovado'
                    : doc.status === 'pending'
                      ? 'Aguardando'
                      : 'Rejeitado - Refazer'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {doc.status === 'ok' ? (
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Ver PDF
                </Button>
              ) : (
                <Button variant="secondary" size="sm" className="text-xs h-7 gap-1">
                  <Upload className="w-3 h-3" /> Solicitar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full" variant="outline">
        <Upload className="w-4 h-4 mr-2" /> Fazer Upload Manual
      </Button>
    </div>
  )
}
