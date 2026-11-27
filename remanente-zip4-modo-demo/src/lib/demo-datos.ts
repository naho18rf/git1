/**
 * DATOS DE DEMOSTRACIÓN. Todo lo de este archivo es ficticio y solo se usa en /demo.
 * Nunca se guarda en la base de datos ni se mezcla con empresas, lotes o cifras reales.
 */
import type { z } from "zod";

import type { fichaMermaSchema } from "./analisis-merma-reglas";

export const DEMO_EMPRESAS = {
  generadora: { nombre: "Taller Textil Aurora (demo)", distrito: "Ate" },
  receptora: {
    nombre: "Emprendimiento Hilos Nuevos (demo)",
    distrito: "Cercado de Lima",
    representante: "Representante de demostración",
    whatsapp: "+51 900 000 000",
    correo: "contacto@demo.invalid",
  },
} as const;

export const DEMO_LOTE = {
  codigo: "RM-DEMO22",
  categoria: "textil",
  pesoKg: 120,
  empaque: "Sacos de 20 kg",
  distrito: DEMO_EMPRESAS.generadora.distrito,
} as const;

/** Misma forma que valida el análisis real (`fichaMermaSchema`). */
export const DEMO_FICHA: z.infer<typeof fichaMermaSchema> = {
  nombre_material: "Retazos de tela de algodón",
  categoria: "textil",
  descripcion:
    "Recortes de tela de algodón de varios colores, de tamaño mediano, provenientes de corte de prendas.",
  condicion: "Limpios y secos a simple vista, sin manchas visibles ni humedad.",
  usos_posibles: [
    "Relleno de cojines y peluches",
    "Patchwork y accesorios artesanales",
    "Trapos industriales de limpieza",
  ],
  recomendaciones:
    "Almacenar en sacos cerrados, en lugar seco y ventilado, separados por color o tipo de tela.",
  confianza: "media",
  no_se_puede_saber:
    "No se puede confirmar la composición exacta de la fibra ni el peso total desde las fotos.",
  aviso_manejo: null,
};

/** Datos que quedan "congelados" en la constancia de la demostración. */
export function snapshotDemo(pesoKg: number) {
  return {
    vendedora: DEMO_EMPRESAS.generadora.nombre,
    compradora: DEMO_EMPRESAS.receptora.nombre,
    lote: DEMO_LOTE.codigo,
    categoria: DEMO_LOTE.categoria,
    peso_kg: pesoKg,
  };
}

/** Huella SHA-256 en hexadecimal (la misma idea que la constancia real, calculada en tu navegador). */
export async function huellaSha256(texto: string): Promise<string> {
  const datos = new TextEncoder().encode(texto);
  const resumen = await globalThis.crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(resumen))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const huellaDemo = (pesoKg: number) => huellaSha256(JSON.stringify(snapshotDemo(pesoKg)));
