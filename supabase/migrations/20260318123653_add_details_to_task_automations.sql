ALTER TABLE public.task_automations 
  ADD COLUMN task_description TEXT,
  ADD COLUMN due_days_offset INTEGER;
