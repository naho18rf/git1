/**
 * Filtros del mercado: lógica pura y sin dependencias, para poder probarla
 * y reutilizarla tanto en la página pública como en el panel.
 */
export type FiltroLotes = { categoria: string; distrito: string };

export const SIN_FILTRO = "";

export function filtrarLotes<T extends { categoria: string; distrito: string }>(
  lotes: readonly T[],
  filtro: FiltroLotes,
): T[] {
  return lotes.filter(
    (lote) =>
      (!filtro.categoria || lote.categoria === filtro.categoria) &&
      (!filtro.distrito || lote.distrito === filtro.distrito),
  );
}

/** Opciones que realmente existen en los lotes mostrados, ordenadas por nombre. */
export function opcionesFiltro<T extends { categoria: string; distrito: string }>(lotes: readonly T[]) {
  return {
    categorias: [...new Set(lotes.map((lote) => lote.categoria))].sort(),
    distritos: [...new Set(lotes.map((lote) => lote.distrito))].sort(),
  };
}

export function hayFiltroActivo(filtro: FiltroLotes): boolean {
  return filtro.categoria !== SIN_FILTRO || filtro.distrito !== SIN_FILTRO;
}
