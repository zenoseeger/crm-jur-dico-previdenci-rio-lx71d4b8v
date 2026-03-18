CREATE TABLE public.whatsapp_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT DEFAULT 'none' CHECK (provider IN ('none', 'z-api')),
    instance_id TEXT,
    token TEXT,
    client_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    media_url TEXT,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.whatsapp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_whatsapp_configs" ON public.whatsapp_configs
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_all_messages" ON public.messages
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
