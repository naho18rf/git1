import { createServerFn } from "@tanstack/react-start";

import { calcularImpacto } from "./factores-impacto";

/**
 * Totales públicos y agregados de CO₂e y agua, calculados con los factores por material.
 * No expone filas ni datos de ninguna empresa: solo cuatro números.
 */
export const impactoCalculado = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("./premium.server");
  const { data, error } = await db()
    .from("operaciones")
    .select("kg_desviados, lotes(categoria)")
    .eq("estado", "completada")
    .limit(10000);
  if (error) throw new Error("No pudimos calcular el impacto.");
  const filas = (data ?? []).map((o) => {
    const lote = Array.isArray(o.lotes) ? o.lotes[0] : o.lotes;
    return { categoria: (lote?.categoria as string | undefined) ?? null, kg: Number(o.kg_desviados) };
  });
  return calcularImpacto(filas);
});
