import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type ImpactoTotales = {
  kg_desviados: number;
  co2e_evitado_kg: number;
  agua_ahorrada_l: number;
  operaciones_completadas: number;
};

const CERO: ImpactoTotales = {
  kg_desviados: 0,
  co2e_evitado_kg: 0,
  agua_ahorrada_l: 0,
  operaciones_completadas: 0,
};

/** Totales públicos agregados de operaciones completadas (0 si aún no hay datos). */
export const impactoPublicoQuery = queryOptions({
  queryKey: ["impacto", "publico"],
  queryFn: async (): Promise<ImpactoTotales> => {
    const { data, error } = await supabase.rpc("impacto_publico");
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return CERO;
    return {
      kg_desviados: Number(row.kg_desviados ?? 0),
      co2e_evitado_kg: Number(row.co2e_evitado_kg ?? 0),
      agua_ahorrada_l: Number(row.agua_ahorrada_l ?? 0),
      operaciones_completadas: Number(row.operaciones_completadas ?? 0),
    };
  },
  staleTime: 60_000,
});

export const formatNumero = (n: number) =>
  new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 }).format(n);
