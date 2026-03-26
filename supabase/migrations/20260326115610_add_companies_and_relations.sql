DO $$ 
BEGIN
  -- Create the companies table
  CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Add missing columns to profiles for multi-tenant and super admin
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

  -- Add company_id to other entities to support multi-tenant architecture
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.whatsapp_configs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

  -- Enable RLS
  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
END $$;

-- Basic RLS policies for companies
DROP POLICY IF EXISTS "authenticated_select_companies" ON public.companies;
CREATE POLICY "authenticated_select_companies" ON public.companies
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_companies" ON public.companies;
CREATE POLICY "authenticated_insert_companies" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (true);
  
DROP POLICY IF EXISTS "authenticated_update_companies" ON public.companies;
CREATE POLICY "authenticated_update_companies" ON public.companies
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_delete_companies" ON public.companies;
CREATE POLICY "authenticated_delete_companies" ON public.companies
  FOR DELETE TO authenticated USING (true);

-- Force schema cache reload so PostgREST immediately picks up the new relations
NOTIFY pgrst, 'reload schema';
