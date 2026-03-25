-- Enable realtime for core tables to ensure immediate synchronization in the UI
DO $$
BEGIN
  -- Messages table
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  
  -- Leads table
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'leads') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE leads;
  END IF;
  
  -- Tags table
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tags') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tags;
  END IF;

  -- Clients table
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'clients') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE clients;
  END IF;

  -- Documents table
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'documents') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE documents;
  END IF;

  -- Pipeline Stages table
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'pipeline_stages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pipeline_stages;
  END IF;
END $$;
