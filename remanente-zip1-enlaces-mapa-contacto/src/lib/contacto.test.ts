import { describe, expect, it } from "vitest";

import { canalesContacto, CONTACTO_CONFIG } from "./contacto";

describe("canales de contacto", () => {
  it("no muestra nada mientras la configuración esté vacía", () => {
    expect(canalesContacto(CONTACTO_CONFIG)).toEqual([]);
  });

  it("acepta un correo y un WhatsApp válidos", () => {
    const canales = canalesContacto({ correo: "hola@ejemplo.pe", whatsapp: "+51 999 888 777" });
    expect(canales.map((c) => c.href)).toEqual([
      "mailto:hola@ejemplo.pe",
      "https://wa.me/51999888777",
    ]);
    expect(canales[1]?.valor).toBe("+51999888777");
  });

  it("descarta valores mal formados en lugar de mostrarlos", () => {
    expect(canalesContacto({ correo: "no-es-correo", whatsapp: "abc" })).toEqual([]);
    expect(canalesContacto({ whatsapp: "12345" })).toEqual([]);
  });
});
