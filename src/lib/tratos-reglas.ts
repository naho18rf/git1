import { z } from "zod";

/** Solicitudes pendientes permitidas a la vez para empresas sin ningún trato completado. */
export const MAX_SOLICITUDES_PENDIENTES = 3;
export const MAX_MENSAJE_SOLICITUD = 300;

export type EstadoTrato = "pendiente" | "solicitada" | "aceptada" | "entregada" | "completada" | "rechazada" | "cancelada" | "con_problema";
export type AccionTrato = "aceptar" | "rechazar" | "cancelar" | "entregar" | "confirmar" | "problema";
export type RolTrato = "vendedora" | "compradora";

export const ESTADO_TRATO_LABEL: Record<EstadoTrato, string> = {
  pendiente: "Pendiente",
  solicitada: "Solicitada",
  aceptada: "Aceptada",
  entregada: "Entregada",
  completada: "Completada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
  con_problema: "Con problema en la entrega",
};

export const OPCIONES_RECOGIDA = [
  "Recogemos con nuestra movilidad",
  "Enviaremos un transporte contratado",
  "Preferimos coordinar la entrega con ustedes",
] as const;

/** Transiciones permitidas: [estado actual, acción, quién puede hacerla]. Debe coincidir con `transicion_trato` en la base de datos. */
const TRANSICIONES: Record<AccionTrato, { desde: EstadoTrato[]; rol: RolTrato[] }> = {
  aceptar: { desde: ["solicitada"], rol: ["vendedora"] },
  rechazar: { desde: ["solicitada"], rol: ["vendedora"] },
  cancelar: { desde: ["solicitada", "aceptada"], rol: ["vendedora", "compradora"] },
  entregar: { desde: ["aceptada"], rol: ["vendedora"] },
  confirmar: { desde: ["entregada"], rol: ["compradora"] },
  problema: { desde: ["entregada"], rol: ["compradora"] },
};

/** Estado al que pasa el trato después de cada acción. Debe coincidir con `transicion_trato`. */
export const ESTADO_DESTINO: Record<AccionTrato, EstadoTrato> = {
  aceptar: "aceptada",
  rechazar: "rechazada",
  cancelar: "cancelada",
  entregar: "entregada",
  confirmar: "completada",
  problema: "con_problema",
};

/** Estado resultante, o null si la acción no está permitida para ese rol en ese estado. */
export function siguienteEstado(estado: EstadoTrato, accion: AccionTrato, rol: RolTrato): EstadoTrato | null {
  return puedeAccion(estado, accion, rol) ? ESTADO_DESTINO[accion] : null;
}

export function puedeAccion(estado: EstadoTrato, accion: AccionTrato, rol: RolTrato) {
  const t = TRANSICIONES[accion];
  return t.desde.includes(estado) && t.rol.includes(rol);
}

export function accionesDisponibles(estado: EstadoTrato, rol: RolTrato): AccionTrato[] {
  return (Object.keys(TRANSICIONES) as AccionTrato[]).filter((a) => puedeAccion(estado, a, rol));
}

/** Los datos de contacto solo se comparten entre las dos empresas una vez aceptado el trato. */
export function contactoVisible(estado: EstadoTrato) {
  return estado === "aceptada" || estado === "entregada" || estado === "completada" || estado === "con_problema";
}

export function puedeSolicitar({ tieneCompletado, pendientes }: { tieneCompletado: boolean; pendientes: number }) {
  return tieneCompletado || pendientes < MAX_SOLICITUDES_PENDIENTES;
}

/**
 * Regla de visibilidad del botón "Solicitar este lote": solo una empresa con sesión
 * puede pedir un lote publicado que no sea suyo. La base de datos vuelve a
 * comprobarlo al crear la solicitud.
 */
export function puedeSolicitarLote({ tieneSesion, esDueno, estado }: { tieneSesion: boolean; esDueno: boolean; estado: string }) {
  return tieneSesion && !esDueno && estado === "publicado";
}

/** Tratos que esperan una acción tuya (para el indicador de pendientes). */
export function esperaMiAccion(estado: EstadoTrato, rol: RolTrato) {
  return accionesDisponibles(estado, rol).some((a) => a !== "cancelar");
}

/** Cuántos tratos esperan una acción de tu empresa (indicador del menú y de las pestañas). */
export function contarPendientes(tratos: { estado: EstadoTrato; rol: RolTrato }[]) {
  return tratos.filter((t) => esperaMiAccion(t.estado, t.rol)).length;
}

export function enlaceWhatsApp(telefono: string | null | undefined) {
  const digitos = (telefono ?? "").replace(/\D/g, "");
  if (!digitos) return null;
  return `https://wa.me/${digitos.length === 9 ? `51${digitos}` : digitos}`;
}

export const solicitarSchema = z.object({
  loteId: z.string().uuid(),
  mensaje: z.string().trim().max(MAX_MENSAJE_SOLICITUD, `El mensaje puede tener hasta ${MAX_MENSAJE_SOLICITUD} caracteres.`).optional().default(""),
  recogida: z.enum(OPCIONES_RECOGIDA, { message: "Cuéntanos cómo recogerán el lote." }),
});

export const accionSchema = z.object({
  id: z.string().uuid(),
  accion: z.enum(["aceptar", "rechazar", "cancelar", "entregar", "confirmar", "problema"]),
  detalle: z.string().trim().max(500).optional().default(""),
  recibido: z.boolean().optional(),
}).refine((v) => v.accion !== "confirmar" || v.recibido === true, "Marca la casilla para confirmar que recibiste el material.");

type Contacto = { nombre_empresa: string | null; representante: string | null; telefono: string | null; correo: string | null };
/** Recorta los datos de la otra empresa según el estado del trato. */
export function datosOtraEmpresa(estado: EstadoTrato, e: Contacto) {
  if (contactoVisible(estado)) return { ...e, contacto: true as const };
  return { nombre_empresa: e.nombre_empresa, representante: null, telefono: null, correo: null, contacto: false as const };
}
