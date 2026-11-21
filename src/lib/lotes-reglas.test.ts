import { describe, expect, it } from "vitest";

import {
  MAX_LOTES_ACTIVOS_EMPRESA_NUEVA,
  debeVolverARevision,
  estadoInicialLote,
  publicarLoteSchema,
  puedeCrearLote,
} from "./lotes-reglas";
import { esCategoriaValida } from "./materiales";

const base = {
  categoria: "textil",
  descripcion: "Retazos de algodón en colores variados",
  peso_kg: 25,
  empaque: "Sacos de 10 kg",
  distrito: "Ate",
  declaracion: true,
  codigoId: "6f1c2a3b-1d2e-4f5a-9b8c-7d6e5f4a3b2c",
  fotos: [
    { ruta: "a/b/1.jpg", enVivo: true },
    { ruta: "a/b/2.jpg", enVivo: true },
  ],
};

describe("lista de materiales", () => {
  it("acepta categorías de la lista", () => {
    expect(esCategoriaValida("textil")).toBe(true);
    expect(esCategoriaValida("jebe_caucho")).toBe(true);
  });
  it("rechaza materiales fuera de la lista", () => {
    expect(esCategoriaValida("baterias")).toBe(false);
    expect(esCategoriaValida("Textil")).toBe(false);
    expect(publicarLoteSchema.safeParse({ ...base, categoria: "pilas" }).success).toBe(false);
  });
});

describe("validación al publicar", () => {
  it("acepta un lote completo", () => {
    expect(publicarLoteSchema.safeParse(base).success).toBe(true);
  });
  it("exige al menos 2 fotos y máximo 6", () => {
    expect(publicarLoteSchema.safeParse({ ...base, fotos: base.fotos.slice(0, 1) }).success).toBe(false);
    const siete = Array.from({ length: 7 }, (_, i) => ({ ruta: `x/${i}.jpg`, enVivo: true }));
    expect(publicarLoteSchema.safeParse({ ...base, fotos: siete }).success).toBe(false);
  });
  it("exige peso mayor a 0 y la declaración aceptada", () => {
    expect(publicarLoteSchema.safeParse({ ...base, peso_kg: 0 }).success).toBe(false);
    expect(publicarLoteSchema.safeParse({ ...base, declaracion: false }).success).toBe(false);
  });
});

describe("límites de lotes", () => {
  it("una empresa nueva puede tener hasta 3 lotes activos", () => {
    expect(MAX_LOTES_ACTIVOS_EMPRESA_NUEVA).toBe(3);
    expect(puedeCrearLote({ lotesActivos: 2, tieneOperacionCompletada: false })).toBe(true);
    expect(puedeCrearLote({ lotesActivos: 3, tieneOperacionCompletada: false })).toBe(false);
  });
  it("con una operación completada no hay límite", () => {
    expect(puedeCrearLote({ lotesActivos: 10, tieneOperacionCompletada: true })).toBe(true);
  });
  it("el primer lote y los que tienen fotos no tomadas en vivo van a revisión", () => {
    expect(estadoInicialLote({ lotesPrevios: 0, hayFotoNoEnVivo: false })).toBe("en_revision");
    expect(estadoInicialLote({ lotesPrevios: 3, hayFotoNoEnVivo: true })).toBe("en_revision");
    expect(estadoInicialLote({ lotesPrevios: 1, hayFotoNoEnVivo: false })).toBe("publicado");
  });
  it("los lotes con reportes acumulados vuelven a revisión", () => {
    expect(debeVolverARevision(1)).toBe(false);
    expect(debeVolverARevision(2)).toBe(true);
  });
});
