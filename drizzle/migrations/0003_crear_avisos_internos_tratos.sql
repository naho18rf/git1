CREATE TABLE public.avisos_tratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  operacion_id uuid NOT NULL REFERENCES public.operaciones(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  titulo text NOT NULL,
  mensaje text NOT NULL,
  leido_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT avisos_tratos_tipo_valido CHECK (tipo IN (
    'solicitud_nueva',
    'solicitud_aceptada',
    'solicitud_rechazada',
    'material_entregado',
    'constancia_emitida',
    'problema_entrega'
  )),
  CONSTRAINT avisos_tratos_evento_unico UNIQUE (operacion_id, tipo, empresa_id)
);

GRANT SELECT, UPDATE ON public.avisos_tratos TO authenticated;
GRANT ALL ON public.avisos_tratos TO service_role;

ALTER TABLE public.avisos_tratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresa ve sus avisos"
ON public.avisos_tratos FOR SELECT
TO authenticated
USING (auth.uid() = empresa_id);

CREATE POLICY "Empresa marca sus avisos como leidos"
ON public.avisos_tratos FOR UPDATE
TO authenticated
USING (auth.uid() = empresa_id)
WITH CHECK (auth.uid() = empresa_id);

CREATE INDEX avisos_tratos_empresa_fecha_idx
ON public.avisos_tratos (empresa_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.avisar_cambio_trato()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.estado = 'solicitada' THEN
    INSERT INTO public.avisos_tratos (empresa_id, operacion_id, tipo, titulo, mensaje)
    VALUES (
      NEW.empresa_vendedora_id,
      NEW.id,
      'solicitud_nueva',
      'Tienes una solicitud nueva',
      'Revisa la solicitud y responde desde Mis tratos.'
    )
    ON CONFLICT (operacion_id, tipo, empresa_id) DO NOTHING;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado THEN
    IF NEW.estado = 'aceptada' THEN
      INSERT INTO public.avisos_tratos (empresa_id, operacion_id, tipo, titulo, mensaje)
      VALUES (
        NEW.empresa_compradora_id,
        NEW.id,
        'solicitud_aceptada',
        'Tu solicitud fue aceptada',
        'Revisa los siguientes pasos desde Mis tratos.'
      )
      ON CONFLICT (operacion_id, tipo, empresa_id) DO NOTHING;
    ELSIF NEW.estado = 'rechazada' THEN
      INSERT INTO public.avisos_tratos (empresa_id, operacion_id, tipo, titulo, mensaje)
      VALUES (
        NEW.empresa_compradora_id,
        NEW.id,
        'solicitud_rechazada',
        'Tu solicitud fue rechazada',
        'Revisa el estado de la solicitud desde Mis tratos.'
      )
      ON CONFLICT (operacion_id, tipo, empresa_id) DO NOTHING;
    ELSIF NEW.estado = 'entregada' THEN
      INSERT INTO public.avisos_tratos (empresa_id, operacion_id, tipo, titulo, mensaje)
      VALUES (
        NEW.empresa_compradora_id,
        NEW.id,
        'material_entregado',
        'El material fue marcado como entregado',
        'Ya puedes confirmar la recepción desde Mis tratos.'
      )
      ON CONFLICT (operacion_id, tipo, empresa_id) DO NOTHING;
    ELSIF NEW.estado = 'completada' THEN
      INSERT INTO public.avisos_tratos (empresa_id, operacion_id, tipo, titulo, mensaje)
      SELECT empresa_id, NEW.id, 'constancia_emitida', 'Tu constancia ya está disponible',
        'Consúltala en Mis tratos. Es un registro de Remanente.'
      FROM (VALUES (NEW.empresa_vendedora_id), (NEW.empresa_compradora_id)) AS partes(empresa_id)
      ON CONFLICT (operacion_id, tipo, empresa_id) DO NOTHING;
    ELSIF NEW.estado = 'con_problema' THEN
      INSERT INTO public.avisos_tratos (empresa_id, operacion_id, tipo, titulo, mensaje)
      SELECT empresa_id, NEW.id, 'problema_entrega', 'Se reportó un problema con la entrega',
        'Revisa el detalle y el estado del trato desde Mis tratos.'
      FROM (VALUES (NEW.empresa_vendedora_id), (NEW.empresa_compradora_id)) AS partes(empresa_id)
      ON CONFLICT (operacion_id, tipo, empresa_id) DO NOTHING;

      INSERT INTO public.avisos_tratos (empresa_id, operacion_id, tipo, titulo, mensaje)
      SELECT ur.user_id, NEW.id, 'problema_entrega', 'Se reportó un problema con la entrega',
        'Revisa el detalle y el estado del trato desde Mis tratos.'
      FROM public.user_roles ur
      WHERE ur.role = 'admin'
      ON CONFLICT (operacion_id, tipo, empresa_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER operaciones_avisos_tratos
AFTER INSERT OR UPDATE ON public.operaciones
FOR EACH ROW
EXECUTE FUNCTION public.avisar_cambio_trato();