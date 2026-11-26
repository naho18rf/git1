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

export type LiderazgoFemenino = {
  respondieron: number;
  dirigidas: number;
};

/**
 * Cifra agregada de liderazgo femenino: solo dos totales de toda la plataforma.
 * Nunca devuelve datos de una empresa en particular.
 */
export const liderazgoFemeninoQuery = queryOptions({
  queryKey: ["impacto", "liderazgo-femenino"],
  queryFn: async (): Promise<LiderazgoFemenino> => {
    const { data, error } = await supabase.rpc("impacto_liderazgo_femenino");
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return {
      respondieron: Number(row?.empresas_que_respondieron ?? 0),
      dirigidas: Number(row?.empresas_dirigidas_mujeres ?? 0),
    };
  },
  staleTime: 60_000,
});

/** Porcentaje con un decimal máximo, en formato es-PE (ej.: 33,3). */
export const formatoPorcentaje = (dirigidas: number, respondieron: number) =>
  new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 }).format(
    (dirigidas / respondieron) * 100,
  );
