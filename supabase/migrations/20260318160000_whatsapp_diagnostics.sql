-- Add new status and diagnostic columns to whatsapp_configs
ALTER TABLE public.whatsapp_configs
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS last_error TEXT,
ADD COLUMN IF NOT EXISTS webhook_verified_at TIMESTAMPTZ;

-- Create whatsapp_logs table for comprehensive diagnostics
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for the new table
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and insert their own logs
CREATE POLICY "authenticated_all_whatsapp_logs" ON public.whatsapp_logs
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
