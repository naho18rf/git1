import { describe, expect, it } from "vitest";

import { coordenadasDistrito, distanciaKm, LIMA_CENTRO } from "./empresas-cercanas";
import { DISTRITOS } from "./peru";

describe("cobertura de distritos del mapa", () => {
  it("tiene coordenadas para todos los distritos que ofrece el registro", () => {
    const sinCoordenadas = DISTRITOS.filter((d) => !coordenadasDistrito(d));
    expect(sinCoordenadas).toEqual([]);
  });

  it("reconoce 'Lima (Cercado)' como el Cercado de Lima", () => {
    expect(coordenadasDistrito("Lima (Cercado)")).toEqual(coordenadasDistrito("Cercado"));
  });

  it("ignora tildes, mayúsculas y espacios sobrantes", () => {
    expect(coordenadasDistrito("  BREÑA ")).toBeDefined();
    expect(coordenadasDistrito("Jesús María")).toBeDefined();
    expect(coordenadasDistrito("Rímac")).toBeDefined();
  });

  it("todas las referencias caen dentro del área de Lima y Callao (~ 60 km del centro)", () => {
    for (const distrito of DISTRITOS) {
      const c = coordenadasDistrito(distrito);
      expect(c, distrito).toBeDefined();
      if (c) expect(distanciaKm(LIMA_CENTRO, c), distrito).toBeLessThan(60);
    }
  });

  it("sigue sin inventar coordenadas para lugares desconocidos", () => {
    expect(coordenadasDistrito("Arequipa")).toBeUndefined();
  });
});
