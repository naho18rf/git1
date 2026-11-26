ALTER TABLE public.empresas
  ADD COLUMN dirigida_por_mujer text
  CHECK (dirigida_por_mujer IS NULL OR dirigida_por_mujer IN ('si', 'no', 'prefiero_no_decir'));

CREATE OR REPLACE FUNCTION public.handle_new_empresa()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ruc text := NULLIF(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'ruc', ''), '[^0-9]', '', 'g'), '');
  v_dirigida text := NEW.raw_user_meta_data->>'dirigida_por_mujer';
BEGIN
  IF v_ruc IS NOT NULL AND v_ruc !~ '^[0-9]{11}$' THEN
    v_ruc := NULL;
  END IF;
  IF v_dirigida NOT IN ('si', 'no', 'prefiero_no_decir') THEN
    v_dirigida := NULL;
  END IF;
  INSERT INTO public.empresas (id, nombre_empresa, ruc, representante, correo, telefono, distrito, direccion, terminos_aceptados_at, dirigida_por_mujer)
  VALUES (
    NEW.id,
    NULLIF(left(NEW.raw_user_meta_data->>'nombre_empresa', 200), ''),
    v_ruc,
    NULLIF(left(NEW.raw_user_meta_data->>'representante', 200), ''),
    NEW.email,
    NULLIF(left(NEW.raw_user_meta_data->>'telefono', 20), ''),
    NULLIF(left(NEW.raw_user_meta_data->>'distrito', 100), ''),
    NULLIF(left(NEW.raw_user_meta_data->>'direccion', 300), ''),
    CASE WHEN (NEW.raw_user_meta_data->>'acepta_terminos') = 'true' THEN now() ELSE NULL END,
    v_dirigida
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.impacto_liderazgo_femenino()
 RETURNS TABLE (empresas_que_respondieron bigint, empresas_dirigidas_mujeres bigint)
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    count(*) FILTER (WHERE e.dirigida_por_mujer IS NOT NULL)::bigint AS empresas_que_respondieron,
    count(*) FILTER (WHERE e.dirigida_por_mujer = 'si')::bigint AS empresas_dirigidas_mujeres
  FROM public.empresas e;
$function$;

REVOKE ALL ON FUNCTION public.impacto_liderazgo_femenino() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.impacto_liderazgo_femenino() TO authenticated, service_role;