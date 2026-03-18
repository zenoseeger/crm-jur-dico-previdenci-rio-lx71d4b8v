CREATE TABLE public.task_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    task_title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.task_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_task_automations" ON public.task_automations
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "authenticated_insert_task_automations" ON public.task_automations
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_update_task_automations" ON public.task_automations
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_delete_task_automations" ON public.task_automations
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
