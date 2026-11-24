import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { esperaMiAccion, type EstadoTrato, type RolTrato } from "./tratos-reglas";

export type AvisoTrato = Pick<
  Tables<"avisos_tratos">,
  "id" | "operacion_id" | "tipo" | "titulo" | "mensaje" | "leido_at" | "created_at"
>;

export const avisosTratosQuery = (userId: string) =>
  queryOptions({
    queryKey: ["avisos-tratos", userId],
    queryFn: async (): Promise<AvisoTrato[]> => {
      const { data, error } = await supabase
        .from("avisos_tratos")
        .select("id, operacion_id, tipo, titulo, mensaje, leido_at, created_at")
        .eq("empresa_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 15_000,
  });

export async function marcarAvisosLeidos(userId: string, ids: string[]) {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("avisos_tratos")
    .update({ leido_at: new Date().toISOString() })
    .eq("empresa_id", userId)
    .in("id", ids)
    .is("leido_at", null);
  if (error) throw error;
}

/** Une avisos y acciones pendientes por trato para no contar dos veces el mismo evento. */
export function contarNovedadesTratos(
  tratos: { id: string; estado: EstadoTrato; rol: RolTrato }[],
  avisos: Pick<AvisoTrato, "operacion_id" | "leido_at">[],
): number {
  const ids = new Set(
    tratos.filter((trato) => esperaMiAccion(trato.estado, trato.rol)).map((trato) => trato.id),
  );
  avisos.filter((aviso) => !aviso.leido_at).forEach((aviso) => ids.add(aviso.operacion_id));
  return ids.size;
}
