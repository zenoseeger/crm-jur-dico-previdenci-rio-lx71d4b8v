CREATE TABLE IF NOT EXISTS public.pipelines (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    user_ids UUID[] DEFAULT '{}'::uuid[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.pipeline_stages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    pipeline_id TEXT NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    auto_tags JSONB DEFAULT '[]'::jsonb,
    auto_tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_pipelines" ON public.pipelines;
CREATE POLICY "authenticated_select_pipelines" ON public.pipelines FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_pipelines" ON public.pipelines;
CREATE POLICY "authenticated_insert_pipelines" ON public.pipelines FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "authenticated_update_pipelines" ON public.pipelines;
CREATE POLICY "authenticated_update_pipelines" ON public.pipelines FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = ANY(user_ids));

DROP POLICY IF EXISTS "authenticated_delete_pipelines" ON public.pipelines;
CREATE POLICY "authenticated_delete_pipelines" ON public.pipelines FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "authenticated_select_pipeline_stages" ON public.pipeline_stages;
CREATE POLICY "authenticated_select_pipeline_stages" ON public.pipeline_stages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_pipeline_stages" ON public.pipeline_stages;
CREATE POLICY "authenticated_insert_pipeline_stages" ON public.pipeline_stages FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_pipeline_stages" ON public.pipeline_stages;
CREATE POLICY "authenticated_update_pipeline_stages" ON public.pipeline_stages FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_delete_pipeline_stages" ON public.pipeline_stages;
CREATE POLICY "authenticated_delete_pipeline_stages" ON public.pipeline_stages FOR DELETE TO authenticated USING (true);

-- Ensure default pipeline exists
DO $$
DECLARE
  first_admin UUID;
BEGIN
  SELECT id INTO first_admin FROM auth.users ORDER BY created_at ASC LIMIT 1;

  IF first_admin IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.pipelines WHERE id = 'p1') THEN
      INSERT INTO public.pipelines (id, name, user_ids, user_id)
      VALUES ('p1', 'Aposentadoria (Padrão)', ARRAY(SELECT id FROM auth.users), first_admin);

      INSERT INTO public.pipeline_stages (id, pipeline_id, name, "order") VALUES
      ('s1', 'p1', 'NOVO LEAD', 0),
      ('s2', 'p1', 'EM QUALIFICAÇÃO', 1),
      ('s3', 'p1', 'AGUARDANDO DOCUMENTOS', 2),
      ('s4', 'p1', 'ANÁLISE JURÍDICA', 3),
      ('s5', 'p1', 'CONTRATO ENVIADO', 4),
      ('s6', 'p1', 'GANHO', 5);
    END IF;
  END IF;
END $$;
