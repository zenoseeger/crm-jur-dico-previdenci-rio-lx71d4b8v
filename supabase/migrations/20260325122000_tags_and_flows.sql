-- Migration to add tags, benefit_types, ai_flows tables and seed initial data
CREATE TABLE IF NOT EXISTS public.tags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_tags" ON public.tags;
CREATE POLICY "authenticated_all_tags" ON public.tags
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.benefit_types (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.benefit_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_benefit_types" ON public.benefit_types;
CREATE POLICY "authenticated_all_benefit_types" ON public.benefit_types
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.ai_flows (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_tag_name TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_flows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_ai_flows" ON public.ai_flows;
CREATE POLICY "authenticated_all_ai_flows" ON public.ai_flows
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN SELECT id FROM auth.users LOOP
    IF NOT EXISTS (SELECT 1 FROM public.tags WHERE user_id = u.id) THEN
      INSERT INTO public.tags (id, user_id, name, color, category) VALUES
        ('t1_' || u.id, u.id, 'Aposentadoria Rural', '#22c55e', 'Tipo de Benefício'),
        ('t2_' || u.id, u.id, 'Falta CNIS', '#ef4444', 'Status de Documentação'),
        ('t3_' || u.id, u.id, 'Segurado Qualificado', '#3b82f6', 'Qualificação'),
        ('t4_' || u.id, u.id, 'Urgente', '#f59e0b', 'Follow-up');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.benefit_types WHERE user_id = u.id) THEN
      INSERT INTO public.benefit_types (id, user_id, name) VALUES
        ('b1_' || u.id, u.id, 'Aposentadoria por Idade'),
        ('b2_' || u.id, u.id, 'Aposentadoria Rural'),
        ('b3_' || u.id, u.id, 'BPC/LOAS'),
        ('b4_' || u.id, u.id, 'Pensão por Morte'),
        ('b5_' || u.id, u.id, 'Auxílio Doença'),
        ('b6_' || u.id, u.id, 'Outros');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.ai_flows WHERE user_id = u.id) THEN
      INSERT INTO public.ai_flows (id, user_id, name, trigger_tag_name, steps) VALUES
        ('f1_' || u.id, u.id, 'Contato Urgente', 'Urgente', '[{"id": "s1", "order": 1, "media": [{"id": "m1", "url": "https://img.usecurling.com/p/200/200?q=document", "name": "documento_exemplo.jpg", "type": "image"}], "prompt": "Crie uma mensagem urgente para agendar a reunião de fechamento hoje.", "dueInDays": 0}]'::jsonb);
    END IF;

    -- Handle pipeline seeding for existing users
    IF NOT EXISTS (SELECT 1 FROM public.pipelines WHERE user_id = u.id) THEN
      INSERT INTO public.pipelines (id, user_id, name, user_ids) VALUES
        ('p1_' || u.id, u.id, 'Aposentadoria (Padrão)', ARRAY[u.id]);
        
      INSERT INTO public.pipeline_stages (id, pipeline_id, name, "order") VALUES
        (gen_random_uuid()::text, 'p1_' || u.id, 'NOVO LEAD', 0),
        (gen_random_uuid()::text, 'p1_' || u.id, 'EM QUALIFICAÇÃO', 1),
        (gen_random_uuid()::text, 'p1_' || u.id, 'AGUARDANDO DOCUMENTOS', 2),
        (gen_random_uuid()::text, 'p1_' || u.id, 'ANÁLISE JURÍDICA', 3),
        (gen_random_uuid()::text, 'p1_' || u.id, 'CONTRATO ENVIADO', 4),
        (gen_random_uuid()::text, 'p1_' || u.id, 'GANHO', 5);
    END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user_seed()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.tags (id, user_id, name, color, category) VALUES
    ('t1_' || NEW.id, NEW.id, 'Aposentadoria Rural', '#22c55e', 'Tipo de Benefício'),
    ('t2_' || NEW.id, NEW.id, 'Falta CNIS', '#ef4444', 'Status de Documentação'),
    ('t3_' || NEW.id, NEW.id, 'Segurado Qualificado', '#3b82f6', 'Qualificação'),
    ('t4_' || NEW.id, NEW.id, 'Urgente', '#f59e0b', 'Follow-up');

  INSERT INTO public.benefit_types (id, user_id, name) VALUES
    ('b1_' || NEW.id, NEW.id, 'Aposentadoria por Idade'),
    ('b2_' || NEW.id, NEW.id, 'Aposentadoria Rural'),
    ('b3_' || NEW.id, NEW.id, 'BPC/LOAS'),
    ('b4_' || NEW.id, NEW.id, 'Pensão por Morte'),
    ('b5_' || NEW.id, NEW.id, 'Auxílio Doença'),
    ('b6_' || NEW.id, NEW.id, 'Outros');

  INSERT INTO public.ai_flows (id, user_id, name, trigger_tag_name, steps) VALUES
    ('f1_' || NEW.id, NEW.id, 'Contato Urgente', 'Urgente', '[{"id": "s1", "order": 1, "media": [{"id": "m1", "url": "https://img.usecurling.com/p/200/200?q=document", "name": "documento_exemplo.jpg", "type": "image"}], "prompt": "Crie uma mensagem urgente para agendar a reunião de fechamento hoje.", "dueInDays": 0}]'::jsonb);

  INSERT INTO public.pipelines (id, user_id, name, user_ids) VALUES
    ('p1_' || NEW.id, NEW.id, 'Aposentadoria (Padrão)', ARRAY[NEW.id]);
    
  INSERT INTO public.pipeline_stages (id, pipeline_id, name, "order") VALUES
    (gen_random_uuid()::text, 'p1_' || NEW.id, 'NOVO LEAD', 0),
    (gen_random_uuid()::text, 'p1_' || NEW.id, 'EM QUALIFICAÇÃO', 1),
    (gen_random_uuid()::text, 'p1_' || NEW.id, 'AGUARDANDO DOCUMENTOS', 2),
    (gen_random_uuid()::text, 'p1_' || NEW.id, 'ANÁLISE JURÍDICA', 3),
    (gen_random_uuid()::text, 'p1_' || NEW.id, 'CONTRATO ENVIADO', 4),
    (gen_random_uuid()::text, 'p1_' || NEW.id, 'GANHO', 5);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_seed ON auth.users;
CREATE TRIGGER on_auth_user_created_seed
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_seed();
