export type PlanId = "gratis" | "basico" | "premium";
export type Suscripcion = { plan: string; vence_at: string | null };

export function esPremium(s: Suscripcion | null | undefined, ahora = new Date()): boolean {
  return s?.plan === "premium" && (!s.vence_at || new Date(s.vence_at) > ahora);
}

/** Pone primero los lotes de empresas Premium y conserva el orden dentro de cada grupo. */
export function priorizarLotes<T extends { empresa_id: string }>(
  lotes: readonly T[],
  premium: ReadonlySet<string>,
) {
  const marcados = lotes.map((l) => ({ ...l, destacado: premium.has(l.empresa_id) }));
  return [...marcados.filter((l) => l.destacado), ...marcados.filter((l) => !l.destacado)];
}

export function sumarImpacto(
  filas: readonly { kg_desviados: number; co2e_evitado_kg: number; agua_ahorrada_l: number }[],
) {
  return filas.reduce(
    (t, f) => ({
      kg: t.kg + Number(f.kg_desviados),
      co2e: t.co2e + Number(f.co2e_evitado_kg),
      agua: t.agua + Number(f.agua_ahorrada_l),
      operaciones: t.operaciones + 1,
    }),
    { kg: 0, co2e: 0, agua: 0, operaciones: 0 },
  );
}
