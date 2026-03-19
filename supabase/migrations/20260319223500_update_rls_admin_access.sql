DO $$
BEGIN
  -- Messages Table
  DROP POLICY IF EXISTS "authenticated_select_messages" ON public.messages;
  DROP POLICY IF EXISTS "authenticated_insert_messages" ON public.messages;
  DROP POLICY IF EXISTS "authenticated_update_messages" ON public.messages;
  DROP POLICY IF EXISTS "authenticated_delete_messages" ON public.messages;
  DROP POLICY IF EXISTS "authenticated_all_messages" ON public.messages;
  
  CREATE POLICY "authenticated_select_messages" ON public.messages
    FOR SELECT TO authenticated USING (
      auth.uid() = user_id OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text
    );
    
  CREATE POLICY "authenticated_insert_messages" ON public.messages
    FOR INSERT TO authenticated WITH CHECK (
      auth.uid() = user_id OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text
    );
    
  CREATE POLICY "authenticated_update_messages" ON public.messages
    FOR UPDATE TO authenticated USING (
      auth.uid() = user_id OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text
    ) WITH CHECK (
      auth.uid() = user_id OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text
    );
    
  CREATE POLICY "authenticated_delete_messages" ON public.messages
    FOR DELETE TO authenticated USING (
      auth.uid() = user_id OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text
    );

  -- WhatsApp Logs Table
  DROP POLICY IF EXISTS "authenticated_select_whatsapp_logs" ON public.whatsapp_logs;
  DROP POLICY IF EXISTS "authenticated_insert_whatsapp_logs" ON public.whatsapp_logs;
  DROP POLICY IF EXISTS "authenticated_update_whatsapp_logs" ON public.whatsapp_logs;
  DROP POLICY IF EXISTS "authenticated_delete_whatsapp_logs" ON public.whatsapp_logs;
  DROP POLICY IF EXISTS "authenticated_all_whatsapp_logs" ON public.whatsapp_logs;
  
  CREATE POLICY "authenticated_select_whatsapp_logs" ON public.whatsapp_logs
    FOR SELECT TO authenticated USING (
      auth.uid() = user_id OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text
    );
    
  CREATE POLICY "authenticated_insert_whatsapp_logs" ON public.whatsapp_logs
    FOR INSERT TO authenticated WITH CHECK (
      auth.uid() = user_id OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text
    );
    
  CREATE POLICY "authenticated_update_whatsapp_logs" ON public.whatsapp_logs
    FOR UPDATE TO authenticated USING (
      auth.uid() = user_id OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text
    ) WITH CHECK (
      auth.uid() = user_id OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text
    );
    
  CREATE POLICY "authenticated_delete_whatsapp_logs" ON public.whatsapp_logs
    FOR DELETE TO authenticated USING (
      auth.uid() = user_id OR (auth.jwt() ->> 'email'::text) = 'zhseeger@gmail.com'::text
    );
END $$;
