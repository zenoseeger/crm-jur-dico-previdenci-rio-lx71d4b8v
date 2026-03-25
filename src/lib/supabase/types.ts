// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      ai_configs: {
        Row: {
          api_key: string | null
          created_at: string
          enabled: boolean | null
          fragment_messages: boolean
          id: string
          knowledge_base: string | null
          model: string | null
          prompt: string | null
          qualification_prompt: string | null
          response_delay: number | null
          trigger_condition: string | null
          trigger_keyword: string | null
          trigger_mode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          enabled?: boolean | null
          fragment_messages?: boolean
          id?: string
          knowledge_base?: string | null
          model?: string | null
          prompt?: string | null
          qualification_prompt?: string | null
          response_delay?: number | null
          trigger_condition?: string | null
          trigger_keyword?: string | null
          trigger_mode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          enabled?: boolean | null
          fragment_messages?: boolean
          id?: string
          knowledge_base?: string | null
          model?: string | null
          prompt?: string | null
          qualification_prompt?: string | null
          response_delay?: number | null
          trigger_condition?: string | null
          trigger_keyword?: string | null
          trigger_mode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_flows: {
        Row: {
          created_at: string
          id: string
          name: string
          steps: Json
          trigger_tag_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          steps?: Json
          trigger_tag_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          steps?: Json
          trigger_tag_name?: string
          user_id?: string
        }
        Relationships: []
      }
      benefit_types: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          benefit_type: string | null
          city: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          lead_id: string | null
          name: string
          phone: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          benefit_type?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_id?: string | null
          name: string
          phone?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          benefit_type?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_id?: string | null
          name?: string
          phone?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'clients_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string
          file_url: string
          id: string
          lead_id: string | null
          name: string
          size: number | null
          type: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          file_url: string
          id?: string
          lead_id?: string | null
          name: string
          size?: number | null
          type?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          file_url?: string
          id?: string
          lead_id?: string | null
          name?: string
          size?: number | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documents_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      leads: {
        Row: {
          active_flows: Json | null
          ai_enabled: boolean | null
          ai_score: number | null
          ai_summary: string | null
          ai_triggered: boolean | null
          assignee: string | null
          benefit_type: string | null
          city: string | null
          created_at: string
          email: string | null
          heat: string | null
          id: string
          name: string
          notes: string | null
          origin_id: string | null
          phone: string | null
          pipeline_id: string | null
          stage: string
          tags: Json | null
          tasks: Json | null
          time_in_stage: string | null
          unread: boolean | null
          user_id: string
        }
        Insert: {
          active_flows?: Json | null
          ai_enabled?: boolean | null
          ai_score?: number | null
          ai_summary?: string | null
          ai_triggered?: boolean | null
          assignee?: string | null
          benefit_type?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          heat?: string | null
          id?: string
          name: string
          notes?: string | null
          origin_id?: string | null
          phone?: string | null
          pipeline_id?: string | null
          stage?: string
          tags?: Json | null
          tasks?: Json | null
          time_in_stage?: string | null
          unread?: boolean | null
          user_id: string
        }
        Update: {
          active_flows?: Json | null
          ai_enabled?: boolean | null
          ai_score?: number | null
          ai_summary?: string | null
          ai_triggered?: boolean | null
          assignee?: string | null
          benefit_type?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          heat?: string | null
          id?: string
          name?: string
          notes?: string | null
          origin_id?: string | null
          phone?: string | null
          pipeline_id?: string | null
          stage?: string
          tags?: Json | null
          tasks?: Json | null
          time_in_stage?: string | null
          unread?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          direction: string | null
          id: string
          lead_id: string | null
          media_url: string | null
          message_type: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          direction?: string | null
          id?: string
          lead_id?: string | null
          media_url?: string | null
          message_type?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          direction?: string | null
          id?: string
          lead_id?: string | null
          media_url?: string | null
          message_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      pipeline_stages: {
        Row: {
          auto_tags: Json | null
          auto_tasks: Json | null
          created_at: string
          id: string
          name: string
          order: number
          pipeline_id: string
        }
        Insert: {
          auto_tags?: Json | null
          auto_tasks?: Json | null
          created_at?: string
          id?: string
          name: string
          order?: number
          pipeline_id: string
        }
        Update: {
          auto_tags?: Json | null
          auto_tasks?: Json | null
          created_at?: string
          id?: string
          name?: string
          order?: number
          pipeline_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pipeline_stages_pipeline_id_fkey'
            columns: ['pipeline_id']
            isOneToOne: false
            referencedRelation: 'pipelines'
            referencedColumns: ['id']
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
          user_ids: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
          user_ids?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
          user_ids?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          category: string
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          category: string
          color: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      task_automations: {
        Row: {
          created_at: string
          due_days_offset: number | null
          id: string
          stage: string
          task_description: string | null
          task_title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_days_offset?: number | null
          id?: string
          stage: string
          task_description?: string | null
          task_title: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_days_offset?: number | null
          id?: string
          stage?: string
          task_description?: string | null
          task_title?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_configs: {
        Row: {
          client_token: string | null
          created_at: string | null
          id: string
          instance_id: string | null
          last_error: string | null
          provider: string | null
          status: string | null
          token: string | null
          user_id: string
          webhook_verified_at: string | null
        }
        Insert: {
          client_token?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          last_error?: string | null
          provider?: string | null
          status?: string | null
          token?: string | null
          user_id: string
          webhook_verified_at?: string | null
        }
        Update: {
          client_token?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          last_error?: string | null
          provider?: string | null
          status?: string | null
          token?: string | null
          user_id?: string
          webhook_verified_at?: string | null
        }
        Relationships: []
      }
      whatsapp_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
