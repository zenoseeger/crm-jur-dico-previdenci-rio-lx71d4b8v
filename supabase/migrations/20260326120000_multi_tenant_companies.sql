DO $$ 
BEGIN
  -- Create companies table
  CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "authenticated_all_companies" ON public.companies;
  CREATE POLICY "authenticated_all_companies" ON public.companies
    FOR ALL TO authenticated USING (true);

  -- Add company_id and is_super_admin to profiles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

  -- Add company_id to other entities
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.whatsapp_configs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.ai_configs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.ai_flows ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.task_automations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  ALTER TABLE public.benefit_types ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

END $$;

-- Update trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, company_id, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'SDR'),
    NULLIF(NEW.raw_user_meta_data->>'company_id', '')::uuid,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    company_id = COALESCE(EXCLUDED.company_id, public.profiles.company_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill default company and super admin
DO $$
DECLARE
  default_company_id UUID;
BEGIN
  UPDATE public.profiles SET is_super_admin = true WHERE email = 'zhseeger@gmail.com';

  IF NOT EXISTS (SELECT 1 FROM public.companies) THEN
    INSERT INTO public.companies (name) VALUES ('Minha Empresa') RETURNING id INTO default_company_id;
    
    UPDATE public.profiles SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.leads SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.pipelines SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.messages SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.whatsapp_configs SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.whatsapp_logs SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.ai_configs SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.ai_flows SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.tags SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.task_automations SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.clients SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.documents SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.benefit_types SET company_id = default_company_id WHERE company_id IS NULL;
  END IF;
END $$;
