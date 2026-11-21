import { describe, expect, it } from "vitest";

import {
  MAX_BYTES_FOTO_ANALISIS,
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
  recomendaciones: "Separar por composición y retirar elementos ajenos antes de reutilizar.",
  confianza: "media",
} as const;

describe("ficha sugerida de merma", () => {
  it("acepta una categoría existente y hasta cinco usos", () => {
    expect(fichaMermaSchema.safeParse(ficha).success).toBe(true);
    expect(
      fichaMermaSchema.safeParse({
        ...ficha,
        usos_posibles: ["Uso 1", "Uso 2", "Uso 3", "Uso 4", "Uso 5"],
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
      fichaMermaSchema.safeParse({ ...ficha, usos_posibles: ["a", "b", "c", "d", "e", "f"] })
        .success,
    ).toBe(false);
  });
});

describe("foto del análisis", () => {
  it("mantiene el límite de 1.5 MB aproximadamente y los formatos JPG, PNG y WebP", () => {
    expect(MAX_BYTES_FOTO_ANALISIS).toBe(1_600_000);
    expect(["image/jpeg", "image/png", "image/webp"].every(tipoImagenValido)).toBe(true);
    expect(tipoImagenValido("image/gif")).toBe(false);
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
