/**
 * Canales de contacto públicos de Remanente.
 *
 * Completa estos valores cuando tengas los datos reales del equipo. Mientras un campo
 * esté vacío, la página de Contacto no lo muestra: no se inventan datos de contacto.
 */
export const CONTACTO_CONFIG = {
  /** Ejemplo de formato: "hola@tudominio.pe" */
  correo: "",
  /** Solo dígitos con código de país, sin "+" ni espacios. Ejemplo de formato: "51999999999" */
  whatsapp: "",
  /** Texto libre. Ejemplo de formato: "Lunes a viernes, 9:00 a 18:00 (hora de Lima)" */
  horario: "",
} as const;

export type CanalContacto = {
  clave: "correo" | "whatsapp";
  etiqueta: string;
  valor: string;
  href: string;
};

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WHATSAPP = /^\d{8,15}$/;

/** Devuelve solo los canales con un valor válido, listos para mostrarse como enlaces. */
export function canalesContacto(config: { correo?: string; whatsapp?: string }): CanalContacto[] {
  const canales: CanalContacto[] = [];
  const correo = config.correo?.trim() ?? "";
  if (CORREO.test(correo)) {
    canales.push({ clave: "correo", etiqueta: "Correo", valor: correo, href: `mailto:${correo}` });
  }
  const whatsapp = (config.whatsapp ?? "").replace(/[\s+()-]/g, "");
  if (WHATSAPP.test(whatsapp)) {
    canales.push({
      clave: "whatsapp",
      etiqueta: "WhatsApp",
      valor: `+${whatsapp}`,
      href: `https://wa.me/${whatsapp}`,
    });
  }
  return canales;
}
