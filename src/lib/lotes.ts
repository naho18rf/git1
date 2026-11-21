import { queryOptions } from "@tanstack/react-query";
import { listarMercado, obtenerPasaporte, listarMisLotes, listarRevision } from "./lotes.functions";

export const mercadoQuery = queryOptions({ queryKey: ["mercado"], queryFn: () => listarMercado(), staleTime: 30_000 });
export const pasaporteQuery = (codigo: string) => queryOptions({ queryKey: ["pasaporte", codigo], queryFn: () => obtenerPasaporte({ data: codigo }) });
export const misLotesQuery = (userId: string) => queryOptions({ queryKey: ["mis-lotes", userId], queryFn: () => listarMisLotes() });
export const revisionQuery = queryOptions({ queryKey: ["revision-lotes"], queryFn: () => listarRevision() });
export function fechaLima(fecha: string | null) {
  return fecha ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" }).format(new Date(fecha)) : "Pendiente de publicación";
}
export const ESTADO_LABEL = { en_revision: "En revisión", publicado: "Publicado", retirado: "Retirado", reservado: "Reservado", entregado: "Entregado" };