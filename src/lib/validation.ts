import { z } from "zod";

import { DISTRITOS } from "./peru";

/** RUC peruano: solo se valida el formato (11 dígitos). */
export const RUC_REGEX = /^\d{11}$/;

export function isValidRuc(value: string): boolean {
  return RUC_REGEX.test(value.trim());
}

/**
 * Normaliza un teléfono peruano a formato +51.
 * Acepta celulares (9 dígitos que empiezan en 9) y fijos de Lima/Callao (01 + 7 dígitos),
 * con o sin prefijo +51, espacios o guiones. Devuelve null si el formato no es válido.
 */
export function normalizePeruPhone(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("51") && digits.length >= 10) digits = digits.slice(2);
  if (/^9\d{8}$/.test(digits)) return `+51${digits}`;
  const fijo = digits.replace(/^0/, "");
  if (/^1\d{7}$/.test(fijo)) return `+51${fijo}`;
  return null;
}

const texto = (campo: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, { message: `Ingresa ${campo}` })
    .max(max, { message: `Máximo ${max} caracteres` });

export const empresaFields = {
  nombre_empresa: texto("el nombre de la empresa", 200),
  ruc: z
    .string()
    .trim()
    .regex(RUC_REGEX, { message: "El RUC debe tener exactamente 11 dígitos" }),
  representante: texto("el nombre del representante", 200),
  telefono: z
    .string()
    .trim()
    .refine((v) => normalizePeruPhone(v) !== null, {
      message: "Usa un celular (9 dígitos) o fijo de Lima (01 + 7 dígitos)",
    }),
  distrito: z
    .string()
    .refine((v) => DISTRITOS.includes(v), { message: "Elige un distrito de Lima o Callao" }),
  direccion: texto("la dirección", 300),
};

export const perfilSchema = z.object(empresaFields);
export type PerfilValues = z.infer<typeof perfilSchema>;

export const registroSchema = z
  .object({
    ...empresaFields,
    correo: z
      .string()
      .trim()
      .email({ message: "Ingresa un correo válido" })
      .max(255, { message: "Máximo 255 caracteres" }),
    password: z
      .string()
      .min(8, { message: "Mínimo 8 caracteres" })
      .max(72, { message: "Máximo 72 caracteres" }),
    confirmacion: z.string(),
    acepta_terminos: z.boolean().refine((v) => v === true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((d) => d.password === d.confirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["confirmacion"],
  });
export type RegistroValues = z.infer<typeof registroSchema>;

export const loginSchema = z.object({
  correo: z.string().trim().email({ message: "Ingresa un correo válido" }),
  password: z.string().min(1, { message: "Ingresa tu contraseña" }),
});

export const nuevaPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Mínimo 8 caracteres" }).max(72),
    confirmacion: z.string(),
  })
  .refine((d) => d.password === d.confirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["confirmacion"],
  });

/** Solo rutas internas relativas: evita redirecciones abiertas. */
export function safeRedirect(value: unknown, fallback = "/panel"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
