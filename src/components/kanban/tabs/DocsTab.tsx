import React, { useRef, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Upload, FileText, File, ImageIcon, Eye, Download, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Lead, DocumentFile } from '@/types'
import useLeadStore from '@/stores/useLeadStore'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DocsTab({ lead }: { lead: Lead }) {
  const { addDocument, removeDocument } = useLeadStore()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !user) return

    setIsUploading(true)

    try {
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`O arquivo ${file.name} não pode exceder 20MB.`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${lead.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('documents').getPublicUrl(fileName)

        const doc: DocumentFile = {
          id: crypto.randomUUID(),
          leadId: lead.id,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date().toISOString(),
          url: data.publicUrl,
        }

        addDocument(lead.id, doc)
      }
      toast.success(`${files.length} documento(s) adicionado(s) com sucesso!`)
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao fazer upload de arquivos.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const leadDocs = [...(lead.documents || [])].sort(
    (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
  )

  return (
    <div className="space-y-4 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Arquivos Anexados
        </h3>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            className="gap-2"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? 'Enviando...' : 'Adicionar Documento'}
          </Button>
        </div>
      </div>

      {leadDocs.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
          <File className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm font-medium">Nenhum documento anexado</p>
          <p className="text-xs mt-1">Faça o upload de arquivos PDF, Imagens ou DOCX</p>
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nome do Arquivo</TableHead>
                <TableHead className="hidden sm:table-cell">Data de Envio</TableHead>
                <TableHead className="hidden sm:table-cell">Tamanho</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium text-sm">
                    <div className="flex items-center gap-2 max-w-[150px] sm:max-w-[250px]">
                      {doc.type.includes('image') ? (
                        <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="truncate" title={doc.name}>
                        {doc.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                    {format(new Date(doc.uploadDate), "dd 'de' MMM, yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                    {formatBytes(doc.size)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                        title="Baixar"
                      >
                        <a href={doc.url} download={doc.name}>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O arquivo "{doc.name}" será
                              permanentemente removido.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                removeDocument(lead.id, doc.id)
                                toast.success('Documento excluído com sucesso')
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
