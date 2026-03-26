DO $BODY$
BEGIN
  -- Create companies table
  CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

  -- Add company_id to profiles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

  -- Create a default company for existing data
  IF NOT EXISTS (SELECT 1 FROM public.companies WHERE id = '00000000-0000-0000-0000-000000000000'::uuid) THEN
    INSERT INTO public.companies (id, name) VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Meu Escritório Padrão');
  END IF;

  UPDATE public.profiles SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;

  -- Add company_id to other tables
  ALTER TABLE public.ai_configs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.ai_flows ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.benefit_types ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.pipeline_stages ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.task_automations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.whatsapp_configs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

  -- Update existing rows
  UPDATE public.ai_configs SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.ai_flows SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.benefit_types SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.clients SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.documents SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.leads SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.messages SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.pipelines SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.pipeline_stages SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.tags SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.task_automations SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.whatsapp_configs SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
  UPDATE public.whatsapp_logs SET company_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE company_id IS NULL;
END $BODY$;

CREATE OR REPLACE FUNCTION public.get_auth_company_id() RETURNS uuid AS $BODY$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$BODY$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.set_company_id() RETURNS trigger AS $BODY$
DECLARE
  u_id UUID;
BEGIN
  IF NEW.company_id IS NULL THEN
    NEW.company_id := public.get_auth_company_id();
    
    -- Fallback for background services / webhooks (Service Role)
    IF NEW.company_id IS NULL THEN
      u_id := (to_jsonb(NEW)->>'user_id')::uuid;
      IF u_id IS NOT NULL THEN
        SELECT company_id INTO NEW.company_id FROM public.profiles WHERE id = u_id LIMIT 1;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql SECURITY DEFINER;

DO $BODY$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['ai_configs', 'ai_flows', 'benefit_types', 'clients', 'documents', 'leads', 'messages', 'pipelines', 'pipeline_stages', 'tags', 'task_automations', 'whatsapp_configs', 'whatsapp_logs'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_company_id_trigger ON public.%I;', t);
    EXECUTE format('CREATE TRIGGER set_company_id_trigger BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_company_id();', t);
  END LOOP;
END $BODY$;

DO $BODY$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['ai_configs', 'ai_flows', 'benefit_types', 'clients', 'documents', 'leads', 'messages', 'pipelines', 'pipeline_stages', 'tags', 'task_automations', 'whatsapp_configs', 'whatsapp_logs'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "tenant_isolation" ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (company_id = public.get_auth_company_id()) WITH CHECK (company_id = public.get_auth_company_id());', t);
  END LOOP;
END $BODY$;

DROP POLICY IF EXISTS "authenticated_select_companies" ON public.companies;
CREATE POLICY "authenticated_select_companies" ON public.companies 
  FOR SELECT TO authenticated 
  USING (id = public.get_auth_company_id() OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text);

DROP POLICY IF EXISTS "superadmin_all_companies" ON public.companies;
CREATE POLICY "superadmin_all_companies" ON public.companies 
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text)
  WITH CHECK ((auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text);

-- Profiles restrictive policy allows super admin to see all profiles
DROP POLICY IF EXISTS "tenant_isolation_profiles" ON public.profiles;
CREATE POLICY "tenant_isolation_profiles" ON public.profiles AS RESTRICTIVE 
  FOR ALL TO authenticated 
  USING (company_id = public.get_auth_company_id() OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text)
  WITH CHECK (company_id = public.get_auth_company_id() OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $BODY$
DECLARE
  new_company_id UUID;
  seed_role TEXT;
BEGIN
  new_company_id := (NEW.raw_user_meta_data->>'company_id')::uuid;
  seed_role := COALESCE(NEW.raw_user_meta_data->>'role', 'SDR');
  
  -- Create isolated company if not specified
  IF new_company_id IS NULL THEN
    new_company_id := gen_random_uuid();
    INSERT INTO public.companies (id, name) VALUES (new_company_id, COALESCE(NEW.raw_user_meta_data->>'name', 'Minha Empresa') || ' - CRM');
    seed_role := 'Admin';
  END IF;

  INSERT INTO public.profiles (id, email, name, role, company_id, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    seed_role,
    new_company_id,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    company_id = COALESCE((NEW.raw_user_meta_data->>'company_id')::uuid, public.profiles.company_id);
    
  -- Initial config seed only when creating the company
  IF (NEW.raw_user_meta_data->>'company_id') IS NULL THEN
    INSERT INTO public.tags (id, user_id, company_id, name, color, category) VALUES
      ('t1_' || NEW.id, NEW.id, new_company_id, 'Aposentadoria Rural', '#22c55e', 'Tipo de Benefício'),
      ('t2_' || NEW.id, NEW.id, new_company_id, 'Falta CNIS', '#ef4444', 'Status de Documentação'),
      ('t3_' || NEW.id, NEW.id, new_company_id, 'Segurado Qualificado', '#3b82f6', 'Qualificação'),
      ('t4_' || NEW.id, NEW.id, new_company_id, 'Urgente', '#f59e0b', 'Follow-up')
    ON CONFLICT DO NOTHING;
  
    INSERT INTO public.benefit_types (id, user_id, company_id, name) VALUES
      ('b1_' || NEW.id, NEW.id, new_company_id, 'Aposentadoria por Idade'),
      ('b2_' || NEW.id, NEW.id, new_company_id, 'Aposentadoria Rural'),
      ('b3_' || NEW.id, NEW.id, new_company_id, 'BPC/LOAS'),
      ('b4_' || NEW.id, NEW.id, new_company_id, 'Pensão por Morte'),
      ('b5_' || NEW.id, NEW.id, new_company_id, 'Auxílio Doença'),
      ('b6_' || NEW.id, NEW.id, new_company_id, 'Outros')
    ON CONFLICT DO NOTHING;
  
    INSERT INTO public.ai_flows (id, user_id, company_id, name, trigger_tag_name, steps) VALUES
      ('f1_' || NEW.id, NEW.id, new_company_id, 'Contato Urgente', 'Urgente', '[{"id": "s1", "order": 1, "media": [], "prompt": "Crie uma mensagem urgente para agendar a reunião de fechamento hoje.", "dueInDays": 0}]'::jsonb)
    ON CONFLICT DO NOTHING;
  
    INSERT INTO public.pipelines (id, user_id, company_id, name, user_ids) VALUES
      ('p1_' || NEW.id, NEW.id, new_company_id, 'Pipeline Padrão', ARRAY[NEW.id])
    ON CONFLICT DO NOTHING;
      
    INSERT INTO public.pipeline_stages (id, pipeline_id, company_id, name, "order") VALUES
      (gen_random_uuid()::text, 'p1_' || NEW.id, new_company_id, 'NOVO LEAD', 0),
      (gen_random_uuid()::text, 'p1_' || NEW.id, new_company_id, 'EM QUALIFICAÇÃO', 1),
      (gen_random_uuid()::text, 'p1_' || NEW.id, new_company_id, 'AGUARDANDO DOCUMENTOS', 2),
      (gen_random_uuid()::text, 'p1_' || NEW.id, new_company_id, 'ANÁLISE JURÍDICA', 3),
      (gen_random_uuid()::text, 'p1_' || NEW.id, new_company_id, 'CONTRATO ENVIADO', 4),
      (gen_random_uuid()::text, 'p1_' || NEW.id, new_company_id, 'GANHO', 5)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql SECURITY DEFINER;
