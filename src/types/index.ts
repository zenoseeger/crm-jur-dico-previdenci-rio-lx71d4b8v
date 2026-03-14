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

// Admin Types
export type UserRole = 'Admin' | 'SDR' | 'Closer' | 'Advogado'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export type TagCategory =
  | 'Tipo de Benefício'
  | 'Status de Documentação'
  | 'Qualificação'
  | 'Follow-up'

export interface TagDef {
  id: string
  name: string
  color: string
  category: TagCategory
}

export interface AIConfig {
  prompt: string
  model: string
  temperature: number
}

export interface WhatsAppConfig {
  token: string
  phoneId: string
  accountId: string
  connected: boolean
  webhookUrl: string
}
