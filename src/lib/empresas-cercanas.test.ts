import { describe, expect, it } from "vitest";
import { coordenadasDistrito, distanciaKm, empresasCercanas, enlacesMapa, LIMA_CENTRO } from "./empresas-cercanas";

const lotes = [
  { empresa_id: "ate", nombre_empresa: "Empresa Ate", distrito: "Ate", categoria: "textil" },
  { empresa_id: "cercado", nombre_empresa: "Empresa Cercado", distrito: "Cercado", categoria: "madera" },
  { empresa_id: "ves", nombre_empresa: "Empresa Sur", distrito: "Villa El Salvador", categoria: "textil" },
];

describe("ubicaciones y distancias del catálogo", () => {
  it("usa Lima Centro como ubicación inicial y de respaldo", () => {
    expect(LIMA_CENTRO).toEqual({ lat: -12.0464, lng: -77.0428 });
  });
  it.each([
    ["Ate", -12.0267, -76.9183], ["Callao", -12.0566, -77.1181],
    ["Villa El Salvador", -12.2133, -76.9378], ["San Juan de Lurigancho", -12.0022, -77.0075],
    ["Los Olivos", -11.9761, -77.0686], ["Cercado", -12.0480, -77.0600],
  ])("conserva las coordenadas proporcionadas de %s", (distrito, lat, lng) => {
    expect(coordenadasDistrito(String(distrito))).toEqual({ lat, lng });
  });
  it("Haversine calcula aproximadamente 1.88 km hasta Cercado", () => {
    expect(distanciaKm(LIMA_CENTRO, { lat: -12.048, lng: -77.06 })).toBeCloseTo(1.88, 2);
    expect(distanciaKm(LIMA_CENTRO, LIMA_CENTRO)).toBe(0);
  });
  it("ordena de menor a mayor distancia", () => {
    expect(empresasCercanas(lotes, LIMA_CENTRO, "todos").map((e) => e.id)).toEqual(["cercado:Cercado", "ate:Ate", "ves:Villa El Salvador"]);
  });
  it.each([[5, 1], [15, 2], [30, 3], ["todos", 3]] as const)("filtra el radio %s", (radio, cantidad) => {
    expect(empresasCercanas(lotes, LIMA_CENTRO, radio)).toHaveLength(cantidad);
  });
  it("agrupa varios materiales sin duplicar empresas", () => {
    const lote = lotes[0];
    if (!lote) throw new Error("Falta el lote de prueba");
    const empresas = empresasCercanas([lote, lote, { ...lote, categoria: "madera" }], LIMA_CENTRO, "todos");
    expect(empresas).toHaveLength(1);
    expect(empresas[0]?.categorias).toEqual(["textil", "madera"]);
  });
  it("no inventa coordenadas para otros distritos ni empresas en un catálogo vacío", () => {
    expect(coordenadasDistrito("Distrito desconocido")).toBeUndefined();
    expect(empresasCercanas([], LIMA_CENTRO, "todos")).toEqual([]);
  });
  it("enlaza al iframe y a las indicaciones con las coordenadas seleccionadas sin claves", () => {
    expect(enlacesMapa({ lat: -12.0267, lng: -76.9183 })).toEqual({
      mapa: "https://maps.google.com/maps?q=-12.0267,-76.9183&t=&z=15&ie=UTF8&iwloc=&output=embed",
      indicaciones: "https://www.google.com/maps/dir/?api=1&destination=-12.0267,-76.9183",
    });
  });
});