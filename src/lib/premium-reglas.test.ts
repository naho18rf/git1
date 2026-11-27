import { describe, expect, it } from "vitest";

import { esPremium, priorizarLotes, sumarImpacto } from "./premium-reglas";

describe("planes Premium", () => {
  const ahora = new Date("2026-11-26T12:00:00Z");
  it("solo es Premium un plan premium vigente", () => {
    expect(esPremium({ plan: "premium", vence_at: null }, ahora)).toBe(true);
    expect(esPremium({ plan: "premium", vence_at: "2026-12-01T00:00:00Z" }, ahora)).toBe(true);
    expect(esPremium({ plan: "premium", vence_at: "2026-11-01T00:00:00Z" }, ahora)).toBe(false);
    expect(esPremium({ plan: "basico", vence_at: null }, ahora)).toBe(false);
    expect(esPremium(null, ahora)).toBe(false);
  });
  it("pone primero los lotes Premium sin alterar el resto del orden", () => {
    const lotes = ["a", "b", "c", "d"].map((empresa_id) => ({ empresa_id }));
    expect(priorizarLotes(lotes, new Set(["c"])).map((l) => l.empresa_id)).toEqual([
      "c",
      "a",
      "b",
      "d",
    ]);
  });
  it("suma el impacto y devuelve ceros sin tratos", () => {
    expect(sumarImpacto([])).toEqual({ kg: 0, co2e: 0, agua: 0, operaciones: 0 });
    const f = { kg_desviados: 10, co2e_evitado_kg: 2, agua_ahorrada_l: 5 };
    expect(sumarImpacto([f, f])).toEqual({ kg: 20, co2e: 4, agua: 10, operaciones: 2 });
  });
});
