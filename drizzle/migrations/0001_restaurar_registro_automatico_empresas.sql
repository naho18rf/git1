CREATE TRIGGER on_auth_user_created_empresa
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_empresa();

WITH usuarios_pendientes AS (
  SELECT
    u.id,
    u.email,
    u.raw_user_meta_data,
    NULLIF(regexp_replace(COALESCE(u.raw_user_meta_data->>'ruc', ''), '[^0-9]', '', 'g'), '') AS ruc_normalizado
  FROM auth.users u
  LEFT JOIN public.empresas e ON e.id = u.id
  WHERE e.id IS NULL
)
INSERT INTO public.empresas (
  id,
  nombre_empresa,
  ruc,
  representante,
  correo,
  telefono,
  distrito,
  direccion,
  terminos_aceptados_at
)
SELECT
  id,
  NULLIF(left(raw_user_meta_data->>'nombre_empresa', 200), ''),
  CASE WHEN ruc_normalizado ~ '^[0-9]{11}$' THEN ruc_normalizado ELSE NULL END,
  NULLIF(left(raw_user_meta_data->>'representante', 200), ''),
  email,
  NULLIF(left(raw_user_meta_data->>'telefono', 20), ''),
  NULLIF(left(raw_user_meta_data->>'distrito', 100), ''),
  NULLIF(left(raw_user_meta_data->>'direccion', 300), ''),
  CASE WHEN raw_user_meta_data->>'acepta_terminos' = 'true' THEN now() ELSE NULL END
FROM usuarios_pendientes
ON CONFLICT (id) DO NOTHING;