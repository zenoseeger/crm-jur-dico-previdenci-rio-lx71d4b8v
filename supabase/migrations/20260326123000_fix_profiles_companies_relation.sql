DO $$ 
BEGIN
  -- 1. Create the companies table if it doesn't exist (Multi-tenant foundation)
  CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Add basic RLS to companies
  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "authenticated_select_companies" ON public.companies;
  CREATE POLICY "authenticated_select_companies" ON public.companies
    FOR SELECT TO authenticated USING (true);
    
  DROP POLICY IF EXISTS "authenticated_insert_companies" ON public.companies;
  CREATE POLICY "authenticated_insert_companies" ON public.companies
    FOR INSERT TO authenticated WITH CHECK (true);

  -- 2. Add required columns to profiles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

  -- 3. Add Foreign Key safely to profiles (Resolves PGRST200)
  IF NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE constraint_name = 'profiles_company_id_fkey'
      AND table_name = 'profiles'
  ) THEN
      ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
  END IF;

  -- 4. Add company_id to other main entities for Multi-tenant isolation
  -- Leads
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_id UUID;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'leads_company_id_fkey' AND table_name = 'leads') THEN
      ALTER TABLE public.leads ADD CONSTRAINT leads_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;

  -- Pipelines
  ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS company_id UUID;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pipelines_company_id_fkey' AND table_name = 'pipelines') THEN
      ALTER TABLE public.pipelines ADD CONSTRAINT pipelines_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;

  -- Messages
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS company_id UUID;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'messages_company_id_fkey' AND table_name = 'messages') THEN
      ALTER TABLE public.messages ADD CONSTRAINT messages_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;

  -- WhatsApp Configs
  ALTER TABLE public.whatsapp_configs ADD COLUMN IF NOT EXISTS company_id UUID;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'whatsapp_configs_company_id_fkey' AND table_name = 'whatsapp_configs') THEN
      ALTER TABLE public.whatsapp_configs ADD CONSTRAINT whatsapp_configs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;

  -- WhatsApp Logs
  ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS company_id UUID;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'whatsapp_logs_company_id_fkey' AND table_name = 'whatsapp_logs') THEN
      ALTER TABLE public.whatsapp_logs ADD CONSTRAINT whatsapp_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;

END $$;

-- Force Supabase PostgREST to reload the schema cache immediately so the frontend query works without restarts
NOTIFY pgrst, 'reload schema';
