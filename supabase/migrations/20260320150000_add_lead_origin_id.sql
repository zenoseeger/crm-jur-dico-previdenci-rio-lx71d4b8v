ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS origin_id UUID;
CREATE INDEX IF NOT EXISTS leads_origin_id_idx ON public.leads(origin_id);
