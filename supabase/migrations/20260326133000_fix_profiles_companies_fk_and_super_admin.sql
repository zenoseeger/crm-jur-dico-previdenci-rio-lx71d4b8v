DO $$ 
BEGIN
  -- 1. Ensure companies table exists
  CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 2. Ensure profiles has necessary columns
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

  -- 3. Add foreign key relationship if it does not exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_company_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Enable RLS and add policies for companies if not present
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_companies" ON public.companies;
CREATE POLICY "authenticated_select_companies" ON public.companies
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "superadmin_all_companies" ON public.companies;
CREATE POLICY "superadmin_all_companies" ON public.companies
  FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- 5. Elevate zhseeger@gmail.com to Super Admin
UPDATE public.profiles
SET 
  is_super_admin = true,
  is_admin = true,
  role = 'Admin'
WHERE email = 'zhseeger@gmail.com';

-- Update auth.users metadata to match
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "Admin", "is_admin": true, "is_super_admin": true}'::jsonb
WHERE email = 'zhseeger@gmail.com';

-- 6. Force schema reload to clear PGRST200 from cache
NOTIFY pgrst, 'reload schema';
