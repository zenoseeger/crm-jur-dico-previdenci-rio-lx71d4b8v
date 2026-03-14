export type Stage = string

export type HeatScore = 'Hot' | 'Warm' | 'Cold'

export interface TaskTemplate {
  id: string
  title: string
  description: string
}

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: string
}

export interface PipelineStage {
  id: string
  name: string
  order: number
  autoTags: string[]
  autoTasks: TaskTemplate[]
}

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
  tasks?: Task[]
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
