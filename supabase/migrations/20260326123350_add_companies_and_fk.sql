DO $$ 
BEGIN
  -- 1. Create companies table
  CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "authenticated_all_companies" ON public.companies;
  CREATE POLICY "authenticated_all_companies" ON public.companies
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- 2. Add columns to profiles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

  -- 3. Safely add the foreign key on profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_company_id_fkey'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
  END IF;

  -- 4. Set the current user as super admin
  UPDATE public.profiles SET is_super_admin = true WHERE email = 'zhseeger@gmail.com';

  -- 5. Create an initial company for existing users to use
  IF NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1) THEN
    INSERT INTO public.companies (id, name) VALUES (gen_random_uuid(), 'Minha Empresa');
  END IF;

  -- 6. Backfill profiles to point to the first company if they don't have one
  UPDATE public.profiles SET company_id = (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1) WHERE company_id IS NULL;

  -- Notify postgrest to reload schema cache
  NOTIFY pgrst, 'reload schema';
END $$;
