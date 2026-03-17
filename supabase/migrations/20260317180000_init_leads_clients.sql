CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    stage TEXT NOT NULL DEFAULT 'NOVO LEAD',
    notes TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pipeline_id TEXT,
    heat TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    time_in_stage TEXT,
    unread BOOLEAN DEFAULT true,
    benefit_type TEXT,
    city TEXT,
    assignee TEXT,
    ai_score INTEGER DEFAULT 0,
    ai_enabled BOOLEAN DEFAULT true,
    ai_triggered BOOLEAN DEFAULT false,
    tasks JSONB DEFAULT '[]'::jsonb,
    active_flows JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT,
    city TEXT,
    benefit_type TEXT,
    cpf TEXT
);

CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    size INTEGER DEFAULT 0,
    type TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_leads" ON public.leads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "authenticated_insert_leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "authenticated_update_leads" ON public.leads FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "authenticated_delete_leads" ON public.leads FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "authenticated_select_clients" ON public.clients FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "authenticated_insert_clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "authenticated_update_clients" ON public.clients FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "authenticated_delete_clients" ON public.clients FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "authenticated_select_documents" ON public.documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "authenticated_insert_documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "authenticated_update_documents" ON public.documents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "authenticated_delete_documents" ON public.documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  lead1_id uuid := gen_random_uuid();
  lead2_id uuid := gen_random_uuid();
  client1_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@escritorio.com',
    crypt('Admin123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Administrador"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', NULL, '', '', ''
  );

  INSERT INTO public.leads (id, name, phone, stage, pipeline_id, benefit_type, city, assignee, ai_score, user_id)
  VALUES 
  (lead1_id, 'Maria das Graças Silva', '(11) 98765-4321', 'NOVO LEAD', 'p1', 'Aposentadoria por Idade', 'São Paulo, SP', 'SDR João', 85, new_user_id),
  (lead2_id, 'Antônio Ferreira', '(31) 99123-4567', 'EM QUALIFICAÇÃO', 'p1', 'BPC/LOAS', 'Belo Horizonte, MG', 'SDR João', 92, new_user_id);

  INSERT INTO public.clients (id, name, phone, status, city, benefit_type, user_id, lead_id)
  VALUES
  (client1_id, 'João Silva', '(11) 98765-4321', 'Cliente Ativo', 'São Paulo', 'Aposentadoria', new_user_id, lead1_id);

  INSERT INTO public.documents (id, name, file_url, size, type, client_id, lead_id, user_id)
  VALUES
  (gen_random_uuid(), 'RG_CPF.pdf', 'https://example.com/rg.pdf', 102400, 'application/pdf', client1_id, lead1_id, new_user_id);
END $$;
