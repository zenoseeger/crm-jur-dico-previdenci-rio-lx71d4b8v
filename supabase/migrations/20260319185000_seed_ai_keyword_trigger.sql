-- Set up specific keyword trigger for testing ai-observer logic
DO $do$
BEGIN
  -- We update existing configs safely. If trigger_keyword is empty, we set it up.
  UPDATE public.ai_configs
  SET trigger_mode = 'keyword',
      trigger_keyword = '...x',
      trigger_condition = 'contains'
  WHERE trigger_keyword IS NULL OR trigger_keyword = '';
END $do$;
