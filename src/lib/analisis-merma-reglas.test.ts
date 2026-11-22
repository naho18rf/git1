import { describe, expect, it } from "vitest";

import {
  MAX_BYTES_FOTO_ANALISIS,
  MAX_FOTOS_ANALISIS,
  cantidadFotosValida,
  fichaMermaSchema,
  firmaImagenValida,
  tipoImagenValido,
} from "./analisis-merma-reglas";

const ficha = {
  nombre_material: "Retazos de algodón",
  categoria: "textil",
  descripcion: "Recortes textiles de distintos tamaños y colores visibles.",
  condicion: "Se observan piezas secas; la limpieza debe verificarse en planta.",
  usos_posibles: ["Relleno textil", "Piezas pequeñas de confección"],
  recomendaciones: "Separar por composición y almacenar seco y cubierto antes de reutilizar.",
  confianza: "media",
  no_se_puede_saber:
    "Las fotos no confirman composición exacta, contaminación, peso ni peligrosidad.",
  aviso_manejo: null,
} as const;

describe("ficha sugerida de merma", () => {
  it("acepta una categoría existente y hasta cinco usos", () => {
    expect(fichaMermaSchema.safeParse(ficha).success).toBe(true);
    expect(
      fichaMermaSchema.safeParse({
        ...ficha,
        usos_posibles: ["Relleno", "Confección", "Aislamiento", "Tapizado", "Manualidades"],
      }).success,
    ).toBe(true);
  });

  it("permite categoría desconocida sin convertirla en una categoría permitida", () => {
    const resultado = fichaMermaSchema.parse({ ...ficha, categoria: null, confianza: "baja" });
    expect(resultado.categoria).toBeNull();
    expect(fichaMermaSchema.safeParse({ ...ficha, categoria: "pilas" }).success).toBe(false);
  });

  it("rechaza más de cinco usos para mantener la ficha concreta", () => {
    expect(
      fichaMermaSchema.safeParse({
        ...ficha,
        usos_posibles: [
          "Relleno",
          "Confección",
          "Aislamiento",
          "Tapizado",
          "Manualidades",
          "Reciclaje",
        ],
      }).success,
    ).toBe(false);
  });

  it("exige las limitaciones de la foto y permite un aviso de manejo especializado", () => {
    const { no_se_puede_saber: _omitido, ...sinLimitaciones } = ficha;
    expect(fichaMermaSchema.safeParse(sinLimitaciones).success).toBe(false);
    expect(
      fichaMermaSchema.parse({
        ...ficha,
        aviso_manejo: "Requiere manejo especializado y validación antes de publicar.",
      }).aviso_manejo,
    ).toContain("validación antes de publicar");
  });
});

describe("fotos del análisis", () => {
  it("mantiene el límite de 1.5 MB aproximadamente y los formatos JPG, PNG y WebP", () => {
    expect(MAX_BYTES_FOTO_ANALISIS).toBe(1_600_000);
    expect(["image/jpeg", "image/png", "image/webp"].every(tipoImagenValido)).toBe(true);
    expect(tipoImagenValido("image/gif")).toBe(false);
  });

  it("permite entre una y tres fotos del mismo residuo", () => {
    expect(MAX_FOTOS_ANALISIS).toBe(3);
    expect(cantidadFotosValida(0)).toBe(false);
    expect(cantidadFotosValida(1)).toBe(true);
    expect(cantidadFotosValida(3)).toBe(true);
    expect(cantidadFotosValida(4)).toBe(false);
  });

  it("comprueba la firma del archivo y no solo su extensión", () => {
    expect(firmaImagenValida(new Uint8Array([255, 216, 255, 0]))).toBe(true);
    expect(firmaImagenValida(new Uint8Array([137, 80, 78, 71]))).toBe(true);
    expect(firmaImagenValida(new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]))).toBe(
      true,
    );
    expect(firmaImagenValida(new Uint8Array([60, 104, 116, 109, 108, 62]))).toBe(false);
  });
});
