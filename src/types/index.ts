export type Stage = string

export type HeatScore = 'Quente' | 'Morno' | 'Frio'

export interface TaskTemplate {
  id: string
  title: string
  description: string
  dueInDays: number
}

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: string
  dueDate?: string
  flowId?: string
  stepOrder?: number
}

export interface DocumentFile {
  id: string
  leadId?: string
  clientId?: string
  name: string
  size: number
  type: string
  uploadDate: string
  url: string
}

export interface Pipeline {
  id: string
  name: string
  userIds: string[]
}

export interface PipelineStage {
  id: string
  pipelineId: string
  name: string
  order: number
  autoTags: string[]
  autoTasks: TaskTemplate[]
}

export interface TaskAutomation {
  id: string
  userId: string
  stage: string
  taskTitle: string
  taskDescription?: string
  dueDaysOffset?: number
  createdAt: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  pipelineId: string
  stage: Stage
  heat: HeatScore
  tags: string[]
  timeInStage: string
  unread: boolean
  benefitType: string
  city: string
  assignee: string
  aiScore: number
  aiSummary?: string
  aiEnabled?: boolean
  aiTriggered?: boolean
  lastMessageAt?: string
  lostReason?: string
  notes?: string
  tasks?: Task[]
  activeFlows?: { flowId: string; currentStepOrder: number }[]
  documents?: DocumentFile[]
  createdAt?: string
}

export interface Client {
  id: string
  name: string
  cpf?: string
  email?: string
  phone: string
  status: string
  date: string
  city?: string
  benefitType?: string
  documents?: DocumentFile[]
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

export type UserRole = 'Admin' | 'Usuário' | 'SDR' | 'Closer' | 'Advogado'

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

export interface BenefitType {
  id: string
  name: string
  createdAt: string
}

export interface AIConfig {
  apiKey: string
  prompt: string
  model: string
  temperature: number
  enabled: boolean
  knowledgeBase: string
  triggerMode: 'always' | 'keyword'
  triggerCondition: 'contains' | 'equals'
  triggerKeyword: string
  qualificationPrompt?: string
}

export type WhatsAppConnectionType = 'official' | 'web'
export type WebSessionStatus =
  | 'disconnected'
  | 'authenticating'
  | 'awaiting_scan'
  | 'connected'
  | 'error'

export interface WhatsAppConfig {
  token: string
  phoneId: string
  accountId: string
  connected: boolean
  webhookUrl: string
  connectionType: WhatsAppConnectionType
  webSessionStatus: WebSessionStatus
  webProfileName?: string
  webProfilePhone?: string
}

export interface DbWhatsAppConfig {
  id: string
  user_id: string
  provider: 'none' | 'z-api'
  instance_id: string | null
  token: string | null
  client_token: string | null
  created_at: string
}

export interface Message {
  id: string
  user_id: string
  lead_id: string | null
  content: string
  direction: 'inbound' | 'outbound'
  media_url: string | null
  message_type:
    | 'text'
    | 'image'
    | 'document'
    | 'audio'
    | 'video'
    | 'sticker'
    | 'location'
    | 'contact'
  created_at: string
}

export interface AIFlowStepMedia {
  id: string
  type: 'image' | 'video' | 'audio'
  url: string
  name: string
}

export interface AIFlowStep {
  id: string
  order: number
  prompt: string
  dueInDays: number
  media?: AIFlowStepMedia[]
}

export interface AIFlow {
  id: string
  name: string
  triggerTagName: string
  steps: AIFlowStep[]
}
