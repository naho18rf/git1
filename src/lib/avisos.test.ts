import { describe, expect, it } from "vitest";

import { contarNovedadesTratos } from "./avisos";

const operacionId = "2d0ce04f-c29b-4bf4-a7b4-0a1ba55c80d2";

describe("avisos de tratos", () => {
  it("cuenta una sola novedad cuando un evento también espera una acción", () => {
    expect(
      contarNovedadesTratos(
        [{ id: operacionId, estado: "solicitada", rol: "vendedora" }],
        [{ operacion_id: operacionId, leido_at: null }],
      ),
    ).toBe(1);
  });

  it("no vuelve a contar un aviso ya leído si el trato no espera una acción", () => {
    expect(
      contarNovedadesTratos(
        [{ id: operacionId, estado: "rechazada", rol: "compradora" }],
        [{ operacion_id: operacionId, leido_at: "2026-11-22T00:00:00Z" }],
      ),
    ).toBe(0);
  });
});
