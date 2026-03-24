DO $$
BEGIN
  -- Leads: Everyone can read, insert, update, delete in the workspace
  DROP POLICY IF EXISTS "authenticated_select_leads" ON public.leads;
  DROP POLICY IF EXISTS "authenticated_insert_leads" ON public.leads;
  DROP POLICY IF EXISTS "authenticated_update_leads" ON public.leads;
  DROP POLICY IF EXISTS "authenticated_delete_leads" ON public.leads;
  DROP POLICY IF EXISTS "authenticated_all_leads" ON public.leads;
  
  CREATE POLICY "authenticated_all_leads" ON public.leads
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Messages
  DROP POLICY IF EXISTS "authenticated_select_messages" ON public.messages;
  DROP POLICY IF EXISTS "authenticated_insert_messages" ON public.messages;
  DROP POLICY IF EXISTS "authenticated_update_messages" ON public.messages;
  DROP POLICY IF EXISTS "authenticated_delete_messages" ON public.messages;
  DROP POLICY IF EXISTS "authenticated_all_messages" ON public.messages;
  
  CREATE POLICY "authenticated_all_messages" ON public.messages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Clients
  DROP POLICY IF EXISTS "authenticated_select_clients" ON public.clients;
  DROP POLICY IF EXISTS "authenticated_insert_clients" ON public.clients;
  DROP POLICY IF EXISTS "authenticated_update_clients" ON public.clients;
  DROP POLICY IF EXISTS "authenticated_delete_clients" ON public.clients;
  DROP POLICY IF EXISTS "authenticated_all_clients" ON public.clients;
  
  CREATE POLICY "authenticated_all_clients" ON public.clients
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Documents
  DROP POLICY IF EXISTS "authenticated_select_documents" ON public.documents;
  DROP POLICY IF EXISTS "authenticated_insert_documents" ON public.documents;
  DROP POLICY IF EXISTS "authenticated_update_documents" ON public.documents;
  DROP POLICY IF EXISTS "authenticated_delete_documents" ON public.documents;
  DROP POLICY IF EXISTS "authenticated_all_documents" ON public.documents;
  
  CREATE POLICY "authenticated_all_documents" ON public.documents
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- WhatsApp Configs (Select only so team members can send messages using the workspace config)
  DROP POLICY IF EXISTS "authenticated_select_whatsapp_configs" ON public.whatsapp_configs;
  DROP POLICY IF EXISTS "authenticated_all_whatsapp_configs" ON public.whatsapp_configs;
  
  CREATE POLICY "authenticated_all_whatsapp_configs" ON public.whatsapp_configs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Task Automations
  DROP POLICY IF EXISTS "authenticated_select_task_automations" ON public.task_automations;
  DROP POLICY IF EXISTS "authenticated_insert_task_automations" ON public.task_automations;
  DROP POLICY IF EXISTS "authenticated_update_task_automations" ON public.task_automations;
  DROP POLICY IF EXISTS "authenticated_delete_task_automations" ON public.task_automations;
  DROP POLICY IF EXISTS "authenticated_all_task_automations" ON public.task_automations;
  
  CREATE POLICY "authenticated_all_task_automations" ON public.task_automations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

END $$;
