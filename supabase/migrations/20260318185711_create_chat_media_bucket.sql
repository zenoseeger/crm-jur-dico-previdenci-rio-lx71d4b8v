-- Create chat-media bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-media', 'chat-media', true) 
ON CONFLICT (id) DO NOTHING;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access for chat-media'
  ) THEN
    CREATE POLICY "Public Access for chat-media" ON storage.objects FOR SELECT USING (bucket_id = 'chat-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can upload to chat-media'
  ) THEN
    CREATE POLICY "Authenticated users can upload to chat-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can update chat-media'
  ) THEN
    CREATE POLICY "Authenticated users can update chat-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'chat-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can delete chat-media'
  ) THEN
    CREATE POLICY "Authenticated users can delete chat-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'chat-media');
  END IF;
END $$;
