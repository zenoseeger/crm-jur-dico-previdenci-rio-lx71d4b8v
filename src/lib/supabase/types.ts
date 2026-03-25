// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
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
            foreignKeyName: "clients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
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
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
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
            foreignKeyName: "messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
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
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: ai_configs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   api_key: text (nullable)
//   model: text (nullable, default: 'gpt-5.4-mini'::text)
//   prompt: text (nullable)
//   qualification_prompt: text (nullable)
//   enabled: boolean (nullable, default: true)
//   knowledge_base: text (nullable)
//   trigger_mode: text (nullable, default: 'always'::text)
//   trigger_condition: text (nullable, default: 'contains'::text)
//   trigger_keyword: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   response_delay: integer (nullable, default: 0)
//   fragment_messages: boolean (not null, default: false)
// Table: ai_flows
//   id: text (not null, default: (gen_random_uuid())::text)
//   user_id: uuid (not null)
//   name: text (not null)
//   trigger_tag_name: text (not null)
//   steps: jsonb (not null, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
// Table: benefit_types
//   id: text (not null, default: (gen_random_uuid())::text)
//   user_id: uuid (not null)
//   name: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: clients
//   id: uuid (not null, default: gen_random_uuid())
//   created_at: timestamp with time zone (not null, default: now())
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   lead_id: uuid (nullable)
//   user_id: uuid (not null)
//   status: text (nullable)
//   city: text (nullable)
//   benefit_type: text (nullable)
//   cpf: text (nullable)
// Table: documents
//   id: uuid (not null, default: gen_random_uuid())
//   created_at: timestamp with time zone (not null, default: now())
//   name: text (not null)
//   file_url: text (not null)
//   size: integer (nullable, default: 0)
//   type: text (nullable)
//   client_id: uuid (nullable)
//   lead_id: uuid (nullable)
//   user_id: uuid (not null)
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   created_at: timestamp with time zone (not null, default: now())
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   stage: text (not null, default: 'NOVO LEAD'::text)
//   notes: text (nullable)
//   user_id: uuid (not null)
//   pipeline_id: text (nullable)
//   heat: text (nullable)
//   tags: jsonb (nullable, default: '[]'::jsonb)
//   time_in_stage: text (nullable)
//   unread: boolean (nullable, default: true)
//   benefit_type: text (nullable)
//   city: text (nullable)
//   assignee: text (nullable)
//   ai_score: integer (nullable, default: 0)
//   ai_enabled: boolean (nullable, default: true)
//   ai_triggered: boolean (nullable, default: false)
//   tasks: jsonb (nullable, default: '[]'::jsonb)
//   active_flows: jsonb (nullable, default: '[]'::jsonb)
//   ai_summary: text (nullable)
//   origin_id: uuid (nullable)
// Table: messages
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   lead_id: uuid (nullable)
//   content: text (not null)
//   direction: text (nullable)
//   media_url: text (nullable)
//   message_type: text (nullable, default: 'text'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: pipeline_stages
//   id: text (not null, default: (gen_random_uuid())::text)
//   pipeline_id: text (not null)
//   name: text (not null)
//   order: integer (not null, default: 0)
//   auto_tags: jsonb (nullable, default: '[]'::jsonb)
//   auto_tasks: jsonb (nullable, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
// Table: pipelines
//   id: text (not null, default: (gen_random_uuid())::text)
//   name: text (not null)
//   user_ids: _uuid (nullable, default: '{}'::uuid[])
//   created_at: timestamp with time zone (not null, default: now())
//   user_id: uuid (not null)
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (nullable)
//   role: text (nullable, default: 'SDR'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: tags
//   id: text (not null, default: (gen_random_uuid())::text)
//   user_id: uuid (not null)
//   name: text (not null)
//   color: text (not null)
//   category: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: task_automations
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   stage: text (not null)
//   task_title: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   task_description: text (nullable)
//   due_days_offset: integer (nullable)
// Table: whatsapp_configs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   provider: text (nullable, default: 'none'::text)
//   instance_id: text (nullable)
//   token: text (nullable)
//   client_token: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   status: text (nullable, default: 'disconnected'::text)
//   last_error: text (nullable)
//   webhook_verified_at: timestamp with time zone (nullable)
// Table: whatsapp_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   event_type: text (not null)
//   message: text (not null)
//   details: jsonb (nullable)
//   created_at: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: ai_configs
//   PRIMARY KEY ai_configs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY ai_configs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE ai_configs_user_id_key: UNIQUE (user_id)
// Table: ai_flows
//   PRIMARY KEY ai_flows_pkey: PRIMARY KEY (id)
//   FOREIGN KEY ai_flows_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: benefit_types
//   PRIMARY KEY benefit_types_pkey: PRIMARY KEY (id)
//   FOREIGN KEY benefit_types_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: clients
//   FOREIGN KEY clients_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
//   FOREIGN KEY clients_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: documents
//   FOREIGN KEY documents_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   FOREIGN KEY documents_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY documents_pkey: PRIMARY KEY (id)
//   FOREIGN KEY documents_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: leads
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY leads_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: messages
//   CHECK messages_direction_check: CHECK ((direction = ANY (ARRAY['inbound'::text, 'outbound'::text])))
//   FOREIGN KEY messages_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
//   CHECK messages_message_type_check: CHECK ((message_type = ANY (ARRAY['text'::text, 'image'::text, 'document'::text, 'audio'::text, 'video'::text, 'sticker'::text, 'location'::text, 'contact'::text, 'other'::text])))
//   PRIMARY KEY messages_pkey: PRIMARY KEY (id)
//   FOREIGN KEY messages_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: pipeline_stages
//   FOREIGN KEY pipeline_stages_pipeline_id_fkey: FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE
//   PRIMARY KEY pipeline_stages_pkey: PRIMARY KEY (id)
// Table: pipelines
//   PRIMARY KEY pipelines_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pipelines_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: tags
//   PRIMARY KEY tags_pkey: PRIMARY KEY (id)
//   FOREIGN KEY tags_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: task_automations
//   PRIMARY KEY task_automations_pkey: PRIMARY KEY (id)
//   FOREIGN KEY task_automations_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: whatsapp_configs
//   PRIMARY KEY whatsapp_configs_pkey: PRIMARY KEY (id)
//   CHECK whatsapp_configs_provider_check: CHECK ((provider = ANY (ARRAY['none'::text, 'z-api'::text])))
//   FOREIGN KEY whatsapp_configs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE whatsapp_configs_user_id_key: UNIQUE (user_id)
// Table: whatsapp_logs
//   PRIMARY KEY whatsapp_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY whatsapp_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: ai_configs
//   Policy "authenticated_delete_ai_configs" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "authenticated_insert_ai_configs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "authenticated_select_ai_configs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "authenticated_update_ai_configs" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: ai_flows
//   Policy "authenticated_all_ai_flows" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: benefit_types
//   Policy "authenticated_all_benefit_types" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: clients
//   Policy "authenticated_all_clients" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: documents
//   Policy "authenticated_all_documents" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: leads
//   Policy "authenticated_all_leads" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: messages
//   Policy "authenticated_all_messages" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: pipeline_stages
//   Policy "authenticated_delete_pipeline_stages" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_pipeline_stages" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_pipeline_stages" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_pipeline_stages" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: pipelines
//   Policy "authenticated_delete_pipelines" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "authenticated_insert_pipelines" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "authenticated_select_pipelines" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_pipelines" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = user_id) OR (auth.uid() = ANY (user_ids)))
// Table: profiles
//   Policy "admin_all_profiles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (((auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'Admin'::text))
//   Policy "authenticated_select_profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: tags
//   Policy "authenticated_all_tags" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: task_automations
//   Policy "authenticated_all_task_automations" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: whatsapp_configs
//   Policy "authenticated_all_whatsapp_configs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: whatsapp_logs
//   Policy "authenticated_delete_whatsapp_logs" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = user_id) OR ((auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text))
//   Policy "authenticated_insert_whatsapp_logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((auth.uid() = user_id) OR ((auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text))
//   Policy "authenticated_select_whatsapp_logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = user_id) OR ((auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text))
//   Policy "authenticated_update_whatsapp_logs" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = user_id) OR ((auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text))
//     WITH CHECK: ((auth.uid() = user_id) OR ((auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text))

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, name, role, created_at)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       NEW.raw_user_meta_data->>'name',
//       COALESCE(NEW.raw_user_meta_data->>'role', 'SDR'),
//       NEW.created_at
//     )
//     ON CONFLICT (id) DO UPDATE SET
//       email = EXCLUDED.email,
//       name = EXCLUDED.name,
//       role = EXCLUDED.role;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_new_user_seed()
//   CREATE OR REPLACE FUNCTION public.handle_new_user_seed()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.tags (id, user_id, name, color, category) VALUES
//       ('t1_' || NEW.id, NEW.id, 'Aposentadoria Rural', '#22c55e', 'Tipo de Benefício'),
//       ('t2_' || NEW.id, NEW.id, 'Falta CNIS', '#ef4444', 'Status de Documentação'),
//       ('t3_' || NEW.id, NEW.id, 'Segurado Qualificado', '#3b82f6', 'Qualificação'),
//       ('t4_' || NEW.id, NEW.id, 'Urgente', '#f59e0b', 'Follow-up');
//   
//     INSERT INTO public.benefit_types (id, user_id, name) VALUES
//       ('b1_' || NEW.id, NEW.id, 'Aposentadoria por Idade'),
//       ('b2_' || NEW.id, NEW.id, 'Aposentadoria Rural'),
//       ('b3_' || NEW.id, NEW.id, 'BPC/LOAS'),
//       ('b4_' || NEW.id, NEW.id, 'Pensão por Morte'),
//       ('b5_' || NEW.id, NEW.id, 'Auxílio Doença'),
//       ('b6_' || NEW.id, NEW.id, 'Outros');
//   
//     INSERT INTO public.ai_flows (id, user_id, name, trigger_tag_name, steps) VALUES
//       ('f1_' || NEW.id, NEW.id, 'Contato Urgente', 'Urgente', '[{"id": "s1", "order": 1, "media": [{"id": "m1", "url": "https://img.usecurling.com/p/200/200?q=document", "name": "documento_exemplo.jpg", "type": "image"}], "prompt": "Crie uma mensagem urgente para agendar a reunião de fechamento hoje.", "dueInDays": 0}]'::jsonb);
//   
//     INSERT INTO public.pipelines (id, user_id, name, user_ids) VALUES
//       ('p1_' || NEW.id, NEW.id, 'Aposentadoria (Padrão)', ARRAY[NEW.id]);
//       
//     INSERT INTO public.pipeline_stages (id, pipeline_id, name, "order") VALUES
//       (gen_random_uuid()::text, 'p1_' || NEW.id, 'NOVO LEAD', 0),
//       (gen_random_uuid()::text, 'p1_' || NEW.id, 'EM QUALIFICAÇÃO', 1),
//       (gen_random_uuid()::text, 'p1_' || NEW.id, 'AGUARDANDO DOCUMENTOS', 2),
//       (gen_random_uuid()::text, 'p1_' || NEW.id, 'ANÁLISE JURÍDICA', 3),
//       (gen_random_uuid()::text, 'p1_' || NEW.id, 'CONTRATO ENVIADO', 4),
//       (gen_random_uuid()::text, 'p1_' || NEW.id, 'GANHO', 5);
//   
//     RETURN NEW;
//   END;
//   $function$
//   

// --- INDEXES ---
// Table: ai_configs
//   CREATE UNIQUE INDEX ai_configs_user_id_key ON public.ai_configs USING btree (user_id)
// Table: leads
//   CREATE INDEX leads_origin_id_idx ON public.leads USING btree (origin_id)
// Table: whatsapp_configs
//   CREATE UNIQUE INDEX whatsapp_configs_user_id_key ON public.whatsapp_configs USING btree (user_id)

