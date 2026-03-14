export type Stage =
  | 'NOVO LEAD'
  | 'EM QUALIFICAÇÃO'
  | 'AGUARDANDO DOCUMENTOS'
  | 'ANÁLISE JURÍDICA'
  | 'REUNIÃO DE FECHAMENTO'
  | 'CONTRATO ENVIADO'
  | 'CLIENTE ATIVO'
  | 'PERDIDO'

export type HeatScore = 'Hot' | 'Warm' | 'Cold'

export interface Lead {
  id: string
  name: string
  phone: string
  stage: Stage
  heat: HeatScore
  tags: string[]
  timeInStage: string
  unread: boolean
  benefitType: string
  city: string
  assignee: string
  aiScore: number
  lastMessageAt?: string
  lostReason?: string
}

export interface ChatMessage {
  id: string
  leadId: string
  sender: 'lead' | 'ai' | 'sdr'
  text: string
  timestamp: string
}

export interface DocumentReq {
  id: string
  name: string
  status: 'ok' | 'pending' | 'rejected'
}
