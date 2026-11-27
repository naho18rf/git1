-- Planes Premium de Remanente. Aplicar ANTES de usar las funciones nuevas.
CREATE TABLE public.suscripciones (
  empresa_id uuid PRIMARY KEY REFERENCES public.empresas(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('gratis','basico','premium')),
  vence_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.alertas_preferencias (
  empresa_id uuid PRIMARY KEY REFERENCES public.empresas(id) ON DELETE CASCADE,
  categorias text[] NOT NULL DEFAULT '{}',
  vistas_at timestamptz NOT NULL DEFAULT now()
);
-- Solo el servidor (service_role) lee y escribe; el navegador no tiene acceso directo.
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_preferencias ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.suscripciones, public.alertas_preferencias FROM anon, authenticated;
GRANT ALL ON public.suscripciones, public.alertas_preferencias TO service_role;
