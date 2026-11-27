import { describe, expect, it } from "vitest";

import { calcularImpacto, FACTORES } from "./factores-impacto";
import { CLAVES_MATERIALES } from "./materiales";

describe("calcularImpacto", () => {
  it("multiplica kg por el factor del material", () => {
    const r = calcularImpacto([{ categoria: "carton_papel", kg: 100 }]);
    expect(r.co2e).toBeCloseTo(63, 5);
    expect(r.agua).toBeCloseTo(2828, 5);
    expect(r.kgConFactor).toBe(100);
    expect(r.kgSinFactor).toBe(0);
  });

  it("no suma CO2e ni agua de materiales sin factor", () => {
    const r = calcularImpacto([{ categoria: "cuero", kg: 50 }, { categoria: null, kg: 10 }]);
    expect(r.co2e).toBe(0);
    expect(r.agua).toBe(0);
    expect(r.kgSinFactor).toBe(60);
  });

  it("ignora pesos inválidos", () => {
    const r = calcularImpacto([{ categoria: "madera", kg: -5 }, { categoria: "madera", kg: Number.NaN }]);
    expect(r.co2e).toBe(0);
  });

  it("todos los factores corresponden a materiales que existen en la app", () => {
    for (const clave of Object.keys(FACTORES)) {
      expect(CLAVES_MATERIALES as readonly string[]).toContain(clave);
    }
  });
});
