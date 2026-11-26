CREATE OR REPLACE FUNCTION public.empresas_sugeridas_lote(p_lote uuid)
RETURNS TABLE(nombre_empresa text, distrito text, ya_solicito boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.nombre_empresa, e.distrito,
    EXISTS (SELECT 1 FROM operaciones o JOIN lotes l2 ON l2.id = o.lote_id
            WHERE o.empresa_compradora_id = e.id AND l2.categoria = l.categoria) AS ya_solicito
  FROM lotes l
  JOIN empresas e ON e.id <> l.empresa_id
  WHERE l.id = p_lote AND l.empresa_id = auth.uid()
    AND coalesce(trim(e.nombre_empresa), '') <> '' AND coalesce(trim(e.distrito), '') <> ''
  LIMIT 500
$$;
REVOKE ALL ON FUNCTION public.empresas_sugeridas_lote(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.empresas_sugeridas_lote(uuid) TO authenticated;