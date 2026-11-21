import { queryOptions } from "@tanstack/react-query";
import { listarMisTratos, verificarConstancia } from "./tratos.functions";

export const misTratosQuery = (userId: string) => queryOptions({ queryKey: ["mis-tratos", userId], queryFn: () => listarMisTratos(), staleTime: 15_000 });
export const constanciaQuery = (numero: string) => queryOptions({ queryKey: ["constancia", numero], queryFn: () => verificarConstancia({ data: numero }) });
export type Trato = Awaited<ReturnType<typeof listarMisTratos>>[number];
