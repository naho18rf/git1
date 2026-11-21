import { describe, expect, it } from "vitest";

import { isValidRuc, normalizePeruPhone, registroSchema, safeRedirect } from "./validation";

const base = {
  nombre_empresa: "Textiles Andinos SAC",
  ruc: "20123456789",
  representante: "Ana Quispe",
  telefono: "987654321",
  distrito: "Ate",
  direccion: "Av. Principal 123",
  correo: "ana@empresa.pe",
  password: "claveSegura1",
  confirmacion: "claveSegura1",
  acepta_terminos: true,
};

describe("RUC", () => {
  it("acepta exactamente 11 dígitos", () => {
    expect(isValidRuc("20123456789")).toBe(true);
  });
  it("rechaza 10 dígitos", () => {
    expect(isValidRuc("2012345678")).toBe(false);
  });
  it("rechaza 12 dígitos", () => {
    expect(isValidRuc("201234567890")).toBe(false);
  });
  it("rechaza letras", () => {
    expect(isValidRuc("20123A56789")).toBe(false);
  });
});

describe("Teléfono Perú", () => {
  it("normaliza un celular de 9 dígitos", () => {
    expect(normalizePeruPhone("987654321")).toBe("+51987654321");
  });
  it("acepta +51 con espacios", () => {
    expect(normalizePeruPhone("+51 987 654 321")).toBe("+51987654321");
  });
  it("acepta fijo de Lima con 01", () => {
    expect(normalizePeruPhone("01 4567890")).toBe("+5114567890");
  });
  it("rechaza celular que no empieza en 9", () => {
    expect(normalizePeruPhone("887654321")).toBeNull();
  });
  it("rechaza números cortos", () => {
    expect(normalizePeruPhone("12345")).toBeNull();
  });
});

describe("Registro de empresa", () => {
  it("acepta datos completos y válidos", () => {
    expect(registroSchema.safeParse(base).success).toBe(true);
  });
  it("exige que la confirmación coincida", () => {
    expect(registroSchema.safeParse({ ...base, confirmacion: "otraClave1" }).success).toBe(false);
  });
  it("exige aceptar los términos", () => {
    expect(registroSchema.safeParse({ ...base, acepta_terminos: false }).success).toBe(false);
  });
  it("exige un distrito de Lima o Callao", () => {
    expect(registroSchema.safeParse({ ...base, distrito: "Arequipa" }).success).toBe(false);
  });
  it("acepta un distrito del Callao", () => {
    expect(registroSchema.safeParse({ ...base, distrito: "Ventanilla" }).success).toBe(true);
  });
});

describe("Redirección segura", () => {
  it("permite rutas internas", () => {
    expect(safeRedirect("/panel/perfil")).toBe("/panel/perfil");
  });
  it("bloquea dominios externos", () => {
    expect(safeRedirect("//evil.com")).toBe("/panel");
    expect(safeRedirect("https://evil.com")).toBe("/panel");
  });
});
