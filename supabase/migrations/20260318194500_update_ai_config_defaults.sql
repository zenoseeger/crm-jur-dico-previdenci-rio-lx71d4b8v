-- Set default model to gpt-5.4-mini in schema
ALTER TABLE public.ai_configs ALTER COLUMN model SET DEFAULT 'gpt-5.4-mini';

-- Ensure empty prompts are updated to avoid meta-commentary
UPDATE public.ai_configs
SET prompt = 'Você é um assistente virtual focado em atendimento direto. Respond as the assistant directly to the user. Do not include analysis, summaries of previous messages, or descriptions of your strategy in the final output.'
WHERE prompt IS NULL OR prompt = '';

-- Upgrade users to gpt-5.4-mini if they are on the previous default or have none
UPDATE public.ai_configs
SET model = 'gpt-5.4-mini'
WHERE model = 'gpt-4o-mini' OR model IS NULL;
