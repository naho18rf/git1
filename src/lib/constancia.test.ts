import { describe, expect, it } from "vitest";
import { aVerificacionPublica, CAMPOS_VERIFICACION_PUBLICA, esNumeroConstancia, fechaHuella, huellaConstancia } from "./constancia";

// Huellas calculadas por la base de datos con `hash_constancia` para estos mismos datos.
const snapshot = {
  vendedora: { nombre: "Textiles Andinos SAC", representante: "Ana Quispe" },
  compradora: { nombre: "Confecciones Sur SAC", representante: null },
  lote: { codigo: "RM-APDS35", categoria: "textil", descripcion: 'Retazos de algodón "finos", separados', peso_kg: 120.5 },
};
const HUELLA_BD = "2446ddabb85b9770d2853e5742c6cb465cbe17b1f3c0634341adad23f5fe87dc";

describe("huella de la constancia", () => {
  it("coincide con la que calculó la base de datos", async () => {
    expect(await huellaConstancia(snapshot, "2026-11-21T22:41:05.123456+00:00")).toBe(HUELLA_BD);
  });
  it("coincide también con un número entero y sin fracción de segundo", async () => {
    const otro = { ...snapshot, lote: { codigo: "RM-APDS35", peso_kg: 1200, categoria: "textil", descripcion: "x" } };
    expect(await huellaConstancia(otro, "2026-11-21T22:41:05+00:00")).toBe("18b02ccb7ae6e633791c7465519fb5298665f61dda869b5a9ac1cb826299ce78");
  });
  it("cambia si alguien altera el peso", async () => {
    const alterado = { ...snapshot, lote: { ...snapshot.lote, peso_kg: 500 } };
    expect(await huellaConstancia(alterado, "2026-11-21T22:41:05.123456+00:00")).not.toBe(HUELLA_BD);
  });
  it("cambia si alguien altera la fecha", async () => {
    expect(await huellaConstancia(snapshot, "2026-11-21T22:41:06.123456+00:00")).not.toBe(HUELLA_BD);
  });
  it("lleva la fecha a UTC con microsegundos", () => {
    expect(fechaHuella("2026-11-21T17:41:05.12-05:00")).toBe("2026-11-21T22:41:05.120000Z");
  });
});

describe("número de constancia", () => {
  it("acepta el formato CE-AAAA-XXXXXX", () => {
    expect(esNumeroConstancia("CE-2026-K7P2QX")).toBe(true);
  });
  it("rechaza otros formatos", () => {
    expect(esNumeroConstancia("CE-26-K7P2QX")).toBe(false);
    expect(esNumeroConstancia("RM-K7P2QX")).toBe(false);
    expect(esNumeroConstancia("CE-2026-K7P2Q")).toBe(false);
  });
});

describe("verificación pública", () => {
  const fila = {
    numero: "CE-2026-K7P2QX", emitida_at: "2026-11-21T22:41:05+00:00", vendedora: "Textiles Andinos SAC", compradora: "Confecciones Sur SAC",
    categoria: "textil", peso_kg: "120.5", hash_valido: true,
    ruc: "20512345678", correo: "ventas@textiles.pe", telefono: "987654321", representante: "Ana Quispe", snapshot,
  };
  it("muestra solo número, fecha, empresas, categoría, peso y si la huella coincide", () => {
    expect(Object.keys(aVerificacionPublica(fila)).sort()).toEqual([...CAMPOS_VERIFICACION_PUBLICA].sort());
  });
  it("no expone RUC, correo, teléfono ni representante", () => {
    const texto = JSON.stringify(aVerificacionPublica(fila));
    for (const privado of ["20512345678", "ventas@textiles.pe", "987654321", "Ana Quispe"]) expect(texto).not.toContain(privado);
  });
  it("solo da por válida la huella cuando la base de datos lo confirma", () => {
    expect(aVerificacionPublica({ ...fila, hash_valido: false }).hash_valido).toBe(false);
    expect(aVerificacionPublica({ ...fila, hash_valido: null }).hash_valido).toBe(false);
  });
});
