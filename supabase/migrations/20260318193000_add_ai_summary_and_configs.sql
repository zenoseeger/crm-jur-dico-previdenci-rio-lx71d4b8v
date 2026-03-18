-- Add ai_summary to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- Create ai_configs table for storing AI settings per user
CREATE TABLE IF NOT EXISTS public.ai_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    api_key TEXT,
    model TEXT DEFAULT 'gpt-4o-mini',
    prompt TEXT,
    qualification_prompt TEXT,
    enabled BOOLEAN DEFAULT true,
    knowledge_base TEXT,
    trigger_mode TEXT DEFAULT 'always',
    trigger_condition TEXT DEFAULT 'contains',
    trigger_keyword TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on ai_configs
ALTER TABLE public.ai_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for ai_configs
CREATE POLICY "authenticated_select_ai_configs" ON public.ai_configs
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "authenticated_insert_ai_configs" ON public.ai_configs
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_update_ai_configs" ON public.ai_configs
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_delete_ai_configs" ON public.ai_configs
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
