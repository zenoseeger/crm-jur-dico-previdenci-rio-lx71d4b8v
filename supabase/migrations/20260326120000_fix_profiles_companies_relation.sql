DO $$
BEGIN
  -- Create companies table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Add company_id to profiles if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN company_id UUID;
  END IF;

  -- Add the foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_company_id_fkey' 
      AND table_schema = 'public'
      AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles 
      ADD CONSTRAINT profiles_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Handle RLS for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_companies" ON public.companies;
CREATE POLICY "authenticated_select_companies" ON public.companies
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_all_companies" ON public.companies;
CREATE POLICY "admin_all_companies" ON public.companies
  FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text OR
    (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'Admin'::text
  );
