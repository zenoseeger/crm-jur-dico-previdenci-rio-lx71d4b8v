DO $$
DECLARE
  new_admin_id uuid := gen_random_uuid();
BEGIN
  -- Insert the admin user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'zhseeger@gmail.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'zhseeger@gmail.com',
      crypt('trip7*2017', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador Global"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "authenticated_select_leads" ON public.leads;
DROP POLICY IF EXISTS "authenticated_insert_leads" ON public.leads;
DROP POLICY IF EXISTS "authenticated_update_leads" ON public.leads;
DROP POLICY IF EXISTS "authenticated_delete_leads" ON public.leads;

DROP POLICY IF EXISTS "authenticated_select_clients" ON public.clients;
DROP POLICY IF EXISTS "authenticated_insert_clients" ON public.clients;
DROP POLICY IF EXISTS "authenticated_update_clients" ON public.clients;
DROP POLICY IF EXISTS "authenticated_delete_clients" ON public.clients;

DROP POLICY IF EXISTS "authenticated_select_documents" ON public.documents;
DROP POLICY IF EXISTS "authenticated_insert_documents" ON public.documents;
DROP POLICY IF EXISTS "authenticated_update_documents" ON public.documents;
DROP POLICY IF EXISTS "authenticated_delete_documents" ON public.documents;

-- Recreate policies for leads
CREATE POLICY "authenticated_select_leads" ON public.leads 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');

CREATE POLICY "authenticated_insert_leads" ON public.leads 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');

CREATE POLICY "authenticated_update_leads" ON public.leads 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com') 
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');

CREATE POLICY "authenticated_delete_leads" ON public.leads 
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');

-- Recreate policies for clients
CREATE POLICY "authenticated_select_clients" ON public.clients 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');

CREATE POLICY "authenticated_insert_clients" ON public.clients 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');

CREATE POLICY "authenticated_update_clients" ON public.clients 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com') 
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');

CREATE POLICY "authenticated_delete_clients" ON public.clients 
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');

-- Recreate policies for documents
CREATE POLICY "authenticated_select_documents" ON public.documents 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');

CREATE POLICY "authenticated_insert_documents" ON public.documents 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');

CREATE POLICY "authenticated_update_documents" ON public.documents 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com') 
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');

CREATE POLICY "authenticated_delete_documents" ON public.documents 
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'zhseeger@gmail.com');
