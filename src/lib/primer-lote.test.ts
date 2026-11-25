import { describe, expect, it } from "vitest";

import { formatoKg, textoCompartir, tratoPrimerLote } from "./primer-lote";

const trato = (id: string, estado: string, completada_at: string | null, kg = 10) => ({
  id,
  estado,
  completada_at,
  constancia: completada_at ? { numero: `CE-2026-${id}` } : null,
  lote: { peso_kg: kg, categoria: "textil" },
});

describe("tratoPrimerLote", () => {
  it("devuelve null si no hay tratos completados", () => {
    expect(tratoPrimerLote([])).toBeNull();
    expect(tratoPrimerLote([trato("A", "entregada", null), trato("B", "con_problema", null)])).toBeNull();
  });

  it("elige el trato completado más antiguo, aunque la lista venga del más nuevo al más viejo", () => {
    const lista = [
      trato("NUEVO", "completada", "2026-11-20T10:00:00Z"),
      trato("VIEJO", "completada", "2026-10-01T10:00:00Z"),
      trato("MEDIO", "completada", "2026-10-15T10:00:00Z"),
    ];
    expect(tratoPrimerLote(lista)?.id).toBe("VIEJO");
  });

  it("ignora tratos que no están completados", () => {
    const lista = [trato("A", "entregada", null), trato("B", "completada", "2026-11-01T10:00:00Z")];
    expect(tratoPrimerLote(lista)?.id).toBe("B");
  });
});

describe("textos de la tarjeta", () => {
  it("formatea kilos con un decimal como máximo", () => {
    expect(formatoKg(12)).toBe("12");
    expect(formatoKg(12.54)).toMatch(/^12[.,]5$/); // coma en es-PE; el punto aparece si el entorno no trae datos de idioma
  });

  it("el texto para compartir incluye los kilos y el enlace de verificación", () => {
    const t = textoCompartir({ kg: 40, urlVerificacion: "https://ejemplo.pe/constancia/CE-2026-ABC234" });
    expect(t).toContain("40 kg");
    expect(t).toContain("https://ejemplo.pe/constancia/CE-2026-ABC234");
  });
});
