DO $$ 
BEGIN
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'SDR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "authenticated_select_profiles" ON public.profiles;
  CREATE POLICY "authenticated_select_profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);
    
  DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
  CREATE POLICY "admin_all_profiles" ON public.profiles
    FOR ALL TO authenticated USING (
      (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text OR
      (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'Admin'::text
    );
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'SDR'),
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users into profiles
INSERT INTO public.profiles (id, email, name, role, created_at)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'name', 
  COALESCE(raw_user_meta_data->>'role', 'SDR'),
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
