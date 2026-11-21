import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { aVerificacionPublica, esNumeroConstancia } from "./constancia";
import { accionSchema, datosOtraEmpresa, MAX_SOLICITUDES_PENDIENTES, solicitarSchema, type EstadoTrato } from "./tratos-reglas";

const MENSAJES_SEGUROS = ["disponible", "propio", "activa", "solicitudes pendientes", "registro", "No encontramos", "no está disponible en el estado"];
function errorAmable(message: string, fallback: string): never {
  throw new Error(MENSAJES_SEGUROS.some((m) => message.includes(m)) ? message : fallback);
}

export const solicitarLote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => solicitarSchema.parse(v)).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.rpc("solicitar_lote_validado", { p_empresa: context.userId, p_lote: data.loteId, p_mensaje: data.mensaje, p_recogida: data.recogida, p_max_pendientes: MAX_SOLICITUDES_PENDIENTES });
  if (error) errorAmable(error.message, "No pudimos enviar la solicitud. Inténtalo de nuevo.");
  return { ok: true };
});

export const accionTrato = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => accionSchema.parse(v)).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: res, error } = await supabaseAdmin.rpc("transicion_trato", { p_empresa: context.userId, p_operacion: data.id, p_accion: data.accion, p_detalle: data.detalle });
  if (error) errorAmable(error.message, "No pudimos actualizar el trato. Inténtalo de nuevo.");
  return res as { ok: boolean; numero?: string };
});

export const listarMisTratos = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const uid = context.userId;
  const { data: ops, error } = await context.supabase.from("operaciones")
    .select("id, estado, mensaje, recogida, created_at, aceptada_at, entregada_at, completada_at, problema_at, problema_detalle, empresa_vendedora_id, empresa_compradora_id, lote_id, constancias(numero, emitida_at, hash_sha256, snapshot)")
    .not("lote_id", "is", null).or(`empresa_vendedora_id.eq.${uid},empresa_compradora_id.eq.${uid}`).order("created_at", { ascending: false });
  if (error) throw new Error("No pudimos cargar tus tratos.");
  const otrasIds = [...new Set(ops.map((o) => (o.empresa_vendedora_id === uid ? o.empresa_compradora_id : o.empresa_vendedora_id)))];
  const loteIds = [...new Set(ops.map((o) => o.lote_id).filter((id): id is string => !!id))];
  const empresas = new Map<string, { nombre_empresa: string | null; representante: string | null; telefono: string | null; correo: string | null }>();
  const lotes = new Map<string, { id: string; codigo: string; categoria: string; peso_kg: number; descripcion: string }>();
  if (ops.length) {
    // Solo se leen empresas y lotes que comparten un trato con quien llama (la compradora no puede leer el lote
    // ajeno por RLS); el contacto se recorta según el estado.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: es }, { data: ls }] = await Promise.all([
      supabaseAdmin.from("empresas").select("id, nombre_empresa, representante, telefono, correo").in("id", otrasIds),
      supabaseAdmin.from("lotes").select("id, codigo, categoria, peso_kg, descripcion").in("id", loteIds),
    ]);
    for (const e of es ?? []) empresas.set(e.id, e);
    for (const l of ls ?? []) lotes.set(l.id, l);
  }
  return ops.map((o) => {
    const rol = o.empresa_vendedora_id === uid ? ("vendedora" as const) : ("compradora" as const);
    const otraId = rol === "vendedora" ? o.empresa_compradora_id : o.empresa_vendedora_id;
    const estado = o.estado as EstadoTrato;
    const constancia = Array.isArray(o.constancias) ? o.constancias[0] ?? null : o.constancias;
    return {
      id: o.id, estado, rol, mensaje: o.mensaje, recogida: o.recogida, created_at: o.created_at,
      aceptada_at: o.aceptada_at, entregada_at: o.entregada_at, completada_at: o.completada_at, problema_at: o.problema_at, problema_detalle: o.problema_detalle,
      lote: (o.lote_id && lotes.get(o.lote_id)) || null, constancia,
      otra: datosOtraEmpresa(estado, empresas.get(otraId) ?? { nombre_empresa: "Empresa", representante: null, telefono: null, correo: null }),
    };
  });
});

export const listarProblemas = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!admin) throw new Error("Esta sección es solo para el equipo administrador.");
  const { data, error } = await context.supabase.from("operaciones").select("id, problema_at, problema_detalle, lotes(codigo)").eq("estado", "con_problema" as never).order("problema_at");
  if (error) throw new Error("No pudimos cargar los tratos con problema.");
  return data;
});

export const verificarConstancia = createServerFn({ method: "GET" }).inputValidator((v: string) => z.string().max(40).parse(v)).handler(async ({ data: numero }) => {
  if (!esNumeroConstancia(numero)) return null;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]; const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("No pudimos verificar la constancia.");
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const h = new Headers(init?.headers); if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h });
  } } });
  const { data, error } = await client.rpc("verificar_constancia", { p_numero: numero });
  if (error) throw new Error("No pudimos verificar la constancia. Inténtalo de nuevo.");
  const fila = data?.[0];
  // Solo datos mínimos: sin RUC, correos, teléfonos ni representantes.
  return fila ? aVerificacionPublica(fila) : null;
});
