import { z } from "zod";

import { CLAVES_MATERIALES } from "./materiales";
import { DISTRITOS } from "./peru";

/** Lotes activos (en revisión o publicados) permitidos a una empresa sin operaciones completadas. */
export const MAX_LOTES_ACTIVOS_EMPRESA_NUEVA = 3;
/** Reportes abiertos con los que un lote publicado vuelve a revisión. */
export const REPORTES_PARA_REVISION = 2;
export const MIN_FOTOS = 2;
export const MAX_FOTOS = 6;
export const MAX_BYTES_FOTO = 1_600_000;
export const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"] as const;
export const MINUTOS_CODIGO = 30;

export const ESTADOS_ACTIVOS = ["en_revision", "publicado"] as const;

export function puedeCrearLote(p: { lotesActivos: number; tieneOperacionCompletada: boolean }): boolean {
  if (p.tieneOperacionCompletada) return true;
  return p.lotesActivos < MAX_LOTES_ACTIVOS_EMPRESA_NUEVA;
}

export function estadoInicialLote(p: {
  lotesPrevios: number;
  hayFotoNoEnVivo: boolean;
}): "en_revision" | "publicado" {
  if (p.lotesPrevios === 0 || p.hayFotoNoEnVivo) return "en_revision";
  return "publicado";
}

export function debeVolverARevision(reportesAbiertos: number): boolean {
  return reportesAbiertos >= REPORTES_PARA_REVISION;
}

export const MENSAJE_LIMITE_LOTES = `Por ahora puedes tener hasta ${MAX_LOTES_ACTIVOS_EMPRESA_NUEVA} lotes activos a la vez. Este límite se levanta cuando completes tu primera entrega con otra empresa: así cuidamos el mercado mientras te conocemos.`;

export const fotoSchema = z.object({
  ruta: z.string().min(1).max(300),
  enVivo: z.boolean(),
});

export const publicarLoteSchema = z.object({
  categoria: z.enum(CLAVES_MATERIALES, {
    errorMap: () => ({ message: "Elige una categoría de la lista de materiales permitidos" }),
  }),
  descripcion: z
    .string()
    .trim()
    .min(10, { message: "Describe el lote con al menos 10 caracteres" })
    .max(1000, { message: "Máximo 1000 caracteres" }),
  peso_kg: z.coerce
    .number({ invalid_type_error: "Ingresa el peso en kg" })
    .positive({ message: "El peso debe ser mayor a 0" })
    .max(1_000_000, { message: "Revisa el peso" }),
  empaque: z.string().trim().min(2, { message: "Indica cómo está empacado" }).max(120, { message: "Máximo 120 caracteres" }),
  distrito: z.string().refine((v) => DISTRITOS.includes(v), { message: "Elige un distrito de Lima o Callao" }),
  declaracion: z.literal(true, { errorMap: () => ({ message: "Debes aceptar la declaración para publicar" }) }),
  codigoId: z.string().uuid({ message: "Genera el código de verificación" }),
  fotos: z
    .array(fotoSchema)
    .min(MIN_FOTOS, { message: `Toma al menos ${MIN_FOTOS} fotos` })
    .max(MAX_FOTOS, { message: `Máximo ${MAX_FOTOS} fotos` }),
});

export type PublicarLoteInput = z.infer<typeof publicarLoteSchema>;

export const MOTIVOS_REPORTE = [
  "La foto no parece del lote",
  "Material no permitido",
  "Sospecha de estafa",
  "Otro",
] as const;

export const reportarSchema = z.object({
  loteId: z.string().uuid(),
  motivo: z.enum(MOTIVOS_REPORTE, { errorMap: () => ({ message: "Elige un motivo" }) }),
  detalle: z.string().trim().max(500, { message: "Máximo 500 caracteres" }).optional(),
});
