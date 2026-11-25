/**
 * Tarjeta "Mi primer lote": reglas puras (sin React ni base de datos).
 * La tarjeta solo usa datos que ya existen en la constancia: no inventa cifras.
 */

type TratoCerrado = {
  estado: string;
  completada_at: string | null;
  constancia: { numero: string } | null;
  lote: { peso_kg: number; categoria: string } | null;
};

/** El primer trato completado de la empresa (por fecha de cierre), sea como vendedora o compradora. */
export function tratoPrimerLote<T extends TratoCerrado>(tratos: T[]): T | null {
  const cerrados = tratos.filter((t) => t.estado === "completada" && t.constancia && t.lote && t.completada_at);
  if (cerrados.length === 0) return null;
  return cerrados.reduce((primero, t) =>
    new Date(t.completada_at as string).getTime() < new Date(primero.completada_at as string).getTime() ? t : primero,
  );
}

/** "12" o "12,5" (es-PE), con un decimal como máximo. */
export function formatoKg(kg: number): string {
  return new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 }).format(kg);
}

export type DatosTarjeta = {
  kg: number;
  /** Nombre legible de la categoría (por ejemplo "Textiles"). */
  categoria: string;
  /** Nombre de la propia empresa; null si no se conoce. */
  empresa: string | null;
  numeroConstancia: string;
  /** Enlace público de verificación de la constancia. */
  urlVerificacion: string;
};

export function textoCompartir(d: Pick<DatosTarjeta, "kg" | "urlVerificacion">): string {
  return `Dimos una segunda vida a ${formatoKg(d.kg)} kg de material con Remanente. Verifica la entrega: ${d.urlVerificacion}`;
}
