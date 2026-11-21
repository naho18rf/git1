CREATE TABLE public.analisis_merma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  ruta_foto text NOT NULL,
  nombre_material text NOT NULL,
  categoria text,
  descripcion text NOT NULL,
  condicion text NOT NULL,
  usos_posibles jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(usos_posibles) = 'array'),
  recomendaciones text NOT NULL,
  confianza text NOT NULL CHECK (confianza IN ('alta', 'media', 'baja')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.analisis_merma TO authenticated;
GRANT ALL ON public.analisis_merma TO service_role;
ALTER TABLE public.analisis_merma ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empresa ve sus analisis" ON public.analisis_merma
  FOR SELECT TO authenticated USING (auth.uid() = empresa_id);
CREATE POLICY "Empresa crea sus analisis" ON public.analisis_merma
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = empresa_id);
CREATE POLICY "Empresa edita sus analisis" ON public.analisis_merma
  FOR UPDATE TO authenticated USING (auth.uid() = empresa_id) WITH CHECK (auth.uid() = empresa_id);
CREATE TRIGGER set_analisis_merma_updated_at
  BEFORE UPDATE ON public.analisis_merma
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Empresa ve fotos de analisis" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'analisis-merma' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Empresa sube fotos de analisis" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'analisis-merma' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Empresa elimina fotos de analisis" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'analisis-merma' AND (storage.foldername(name))[1] = auth.uid()::text
  );