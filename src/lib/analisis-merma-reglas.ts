import { z } from "zod";

import { CLAVES_MATERIALES } from "./materiales";
import { MAX_BYTES_FOTO, TIPOS_FOTO } from "./lotes-reglas";

export const MAX_BYTES_FOTO_ANALISIS = MAX_BYTES_FOTO;
export const TIPOS_FOTO_ANALISIS = TIPOS_FOTO;

export const fichaMermaSchema = z.object({
  nombre_material: z
    .string()
    .trim()
    .min(2, "Escribe el nombre del material.")
    .max(120, "Máximo 120 caracteres."),
  categoria: z.enum(CLAVES_MATERIALES).nullable(),
  descripcion: z
    .string()
    .trim()
    .min(10, "Describe el material con al menos 10 caracteres.")
    .max(1000, "Máximo 1000 caracteres."),
  condicion: z
    .string()
    .trim()
    .min(2, "Describe la condición visible.")
    .max(500, "Máximo 500 caracteres."),
  usos_posibles: z.array(z.string().trim().min(2).max(160)).max(5, "Indica hasta 5 usos posibles."),
  recomendaciones: z
    .string()
    .trim()
    .min(2, "Añade una recomendación.")
    .max(1000, "Máximo 1000 caracteres."),
  confianza: z.enum(["alta", "media", "baja"]),
});

export const actualizarFichaSchema = fichaMermaSchema.omit({ confianza: true }).extend({
  id: z.string().uuid(),
});

export type FichaMerma = z.infer<typeof fichaMermaSchema>;
export type FichaMermaEditable = z.infer<typeof actualizarFichaSchema>;

export function tipoImagenValido(tipo: string): boolean {
  return (TIPOS_FOTO_ANALISIS as readonly string[]).includes(tipo);
}

export function firmaImagenValida(bytes: Uint8Array): boolean {
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return jpeg || png || webp;
}
