DO $ 
DECLARE
  default_company_id UUID;
BEGIN
  -- 1. Create Companies Table
  CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT DEFAULT 'active'
  );

  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

  -- 2. Create Default Company
  INSERT INTO public.companies (id, name) 
  VALUES (gen_random_uuid(), 'Minha Empresa')
  ON CONFLICT DO NOTHING
  RETURNING id INTO default_company_id;

  IF default_company_id IS NULL THEN
    SELECT id INTO default_company_id FROM public.companies LIMIT 1;
  END IF;

  -- 3. Alter Profiles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

  UPDATE public.profiles SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE public.profiles SET is_super_admin = true WHERE email = 'zhseeger@gmail.com';

  ALTER TABLE public.profiles ALTER COLUMN company_id SET NOT NULL;

  -- 4. Alter other tables
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.leads SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.leads ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.clients SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.clients ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.documents SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.documents ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.messages SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.messages ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.pipelines SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.pipelines ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.pipeline_stages ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.pipeline_stages SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.pipeline_stages ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.tags SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.tags ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.task_automations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.task_automations SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.task_automations ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.ai_configs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.ai_configs SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.ai_configs ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.ai_flows ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.ai_flows SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.ai_flows ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.benefit_types ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.benefit_types SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.benefit_types ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.whatsapp_configs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.whatsapp_configs SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.whatsapp_configs ALTER COLUMN company_id SET NOT NULL;

  ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
  UPDATE public.whatsapp_logs SET company_id = default_company_id WHERE company_id IS NULL;
  ALTER TABLE public.whatsapp_logs ALTER COLUMN company_id SET NOT NULL;

END $;

-- Triggers and Functions
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid AS $
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $
  SELECT is_super_admin FROM public.profiles WHERE id = auth.uid();
$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.set_company_id()
RETURNS trigger AS $
BEGIN
  IF NEW.company_id IS NULL THEN
    NEW.company_id := public.get_user_company_id();
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DO $ 
DECLARE
  t text;
  tables text[] := ARRAY['leads', 'clients', 'documents', 'messages', 'pipelines', 'pipeline_stages', 'tags', 'task_automations', 'ai_configs', 'ai_flows', 'benefit_types', 'whatsapp_configs', 'whatsapp_logs'];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_company_id_trigger ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_company_id_trigger BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_company_id()', t);
  END LOOP;
END $;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $
DECLARE
  new_company_id UUID;
BEGIN
  IF NEW.raw_user_meta_data->>'company_id' IS NOT NULL THEN
    new_company_id := (NEW.raw_user_meta_data->>'company_id')::UUID;
  ELSE
    INSERT INTO public.companies (name) VALUES (COALESCE(NEW.raw_user_meta_data->>'name', 'Minha Empresa')) RETURNING id INTO new_company_id;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, created_at, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'Admin'),
    NEW.created_at,
    new_company_id
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    company_id = COALESCE(EXCLUDED.company_id, public.profiles.company_id);
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user_seed()
RETURNS trigger AS $
DECLARE
  user_company_id UUID;
BEGIN
  SELECT company_id INTO user_company_id FROM public.profiles WHERE id = NEW.id;

  IF user_company_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.tags (id, user_id, company_id, name, color, category) VALUES
    ('t1_' || NEW.id, NEW.id, user_company_id, 'Aposentadoria Rural', '#22c55e', 'Tipo de Benefício'),
    ('t2_' || NEW.id, NEW.id, user_company_id, 'Falta CNIS', '#ef4444', 'Status de Documentação'),
    ('t3_' || NEW.id, NEW.id, user_company_id, 'Segurado Qualificado', '#3b82f6', 'Qualificação'),
    ('t4_' || NEW.id, NEW.id, user_company_id, 'Urgente', '#f59e0b', 'Follow-up')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.benefit_types (id, user_id, company_id, name) VALUES
    ('b1_' || NEW.id, NEW.id, user_company_id, 'Aposentadoria por Idade'),
    ('b2_' || NEW.id, NEW.id, user_company_id, 'Aposentadoria Rural'),
    ('b3_' || NEW.id, NEW.id, user_company_id, 'BPC/LOAS'),
    ('b4_' || NEW.id, NEW.id, user_company_id, 'Pensão por Morte'),
    ('b5_' || NEW.id, NEW.id, user_company_id, 'Auxílio Doença'),
    ('b6_' || NEW.id, NEW.id, user_company_id, 'Outros')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ai_flows (id, user_id, company_id, name, trigger_tag_name, steps) VALUES
    ('f1_' || NEW.id, NEW.id, user_company_id, 'Contato Urgente', 'Urgente', '[{"id": "s1", "order": 1, "media": [{"id": "m1", "url": "https://img.usecurling.com/p/200/200?q=document", "name": "documento_exemplo.jpg", "type": "image"}], "prompt": "Crie uma mensagem urgente para agendar a reunião de fechamento hoje.", "dueInDays": 0}]'::jsonb)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.pipelines (id, user_id, company_id, name, user_ids) VALUES
    ('p1_' || NEW.id, NEW.id, user_company_id, 'Aposentadoria (Padrão)', ARRAY[NEW.id])
  ON CONFLICT DO NOTHING;
    
  INSERT INTO public.pipeline_stages (id, pipeline_id, company_id, name, "order") VALUES
    (gen_random_uuid()::text, 'p1_' || NEW.id, user_company_id, 'NOVO LEAD', 0),
    (gen_random_uuid()::text, 'p1_' || NEW.id, user_company_id, 'EM QUALIFICAÇÃO', 1),
    (gen_random_uuid()::text, 'p1_' || NEW.id, user_company_id, 'AGUARDANDO DOCUMENTOS', 2),
    (gen_random_uuid()::text, 'p1_' || NEW.id, user_company_id, 'ANÁLISE JURÍDICA', 3),
    (gen_random_uuid()::text, 'p1_' || NEW.id, user_company_id, 'CONTRATO ENVIADO', 4),
    (gen_random_uuid()::text, 'p1_' || NEW.id, user_company_id, 'GANHO', 5)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate Seed Trigger to ensure it runs AFTER handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created_seed ON auth.users;
DROP TRIGGER IF EXISTS z_on_auth_user_created_seed ON auth.users;
CREATE TRIGGER z_on_auth_user_created_seed
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_seed();

-- RLS Policies
DO $ 
DECLARE
  t text;
  tables text[] := ARRAY['profiles', 'leads', 'clients', 'documents', 'messages', 'pipelines', 'pipeline_stages', 'tags', 'task_automations', 'ai_configs', 'ai_flows', 'benefit_types', 'whatsapp_configs', 'whatsapp_logs'];
BEGIN
  -- Companies
  DROP POLICY IF EXISTS "superadmin_all_companies" ON public.companies;
  CREATE POLICY "superadmin_all_companies" ON public.companies FOR ALL TO authenticated USING (public.is_super_admin());

  DROP POLICY IF EXISTS "user_select_own_company" ON public.companies;
  CREATE POLICY "user_select_own_company" ON public.companies FOR SELECT TO authenticated USING (id = public.get_user_company_id() OR public.is_super_admin());

  -- General
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_select_%I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_insert_%I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_update_%I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_delete_%I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_all_%I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation_%I" ON public.%I', t, t);

    IF t = 'profiles' THEN
      EXECUTE 'CREATE POLICY "tenant_isolation_profiles" ON public.profiles FOR ALL TO authenticated USING (company_id = public.get_user_company_id() OR public.is_super_admin()) WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin())';
    ELSE
      EXECUTE format('CREATE POLICY "tenant_isolation_%I" ON public.%I FOR ALL TO authenticated USING (company_id = public.get_user_company_id() OR public.is_super_admin()) WITH CHECK (company_id = public.get_user_company_id() OR public.is_super_admin())', t, t);
    END IF;
  END LOOP;
END $;
