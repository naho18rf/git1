ALTER TABLE public.analisis_merma
  ADD COLUMN rutas_fotos jsonb,
  ADD COLUMN no_se_puede_saber text,
  ADD COLUMN aviso_manejo text;

UPDATE public.analisis_merma
SET
  rutas_fotos = jsonb_build_array(ruta_foto),
  no_se_puede_saber = 'La composición exacta, la contaminación, el peso y la peligrosidad no se pueden confirmar solo con fotos.'
WHERE rutas_fotos IS NULL;

ALTER TABLE public.analisis_merma
  ALTER COLUMN rutas_fotos SET DEFAULT '[]'::jsonb,
  ALTER COLUMN rutas_fotos SET NOT NULL,
  ALTER COLUMN no_se_puede_saber SET DEFAULT 'La composición exacta, la contaminación, el peso y la peligrosidad no se pueden confirmar solo con fotos.',
  ALTER COLUMN no_se_puede_saber SET NOT NULL;

ALTER TABLE public.analisis_merma
  ADD CONSTRAINT analisis_merma_rutas_fotos_limite
  CHECK (jsonb_typeof(rutas_fotos) = 'array' AND jsonb_array_length(rutas_fotos) BETWEEN 1 AND 3);