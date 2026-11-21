import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MAX_BYTES_FOTO, MAX_LOTES_ACTIVOS_EMPRESA_NUEVA, MINUTOS_CODIGO, REPORTES_PARA_REVISION, TIPOS_FOTO, publicarLoteSchema, reportarSchema } from "./lotes-reglas";

export const listarMercado = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  const url = process.env['SUPABASE_URL'];
  if (!key || !url) throw new Error("No pudimos cargar el mercado.");
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers); if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization"); headers.set("apikey", key); return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await client.rpc("mercado_lotes");
  if (error) throw new Error("No pudimos cargar el mercado. Inténtalo de nuevo.");
  return Promise.all((data ?? []).map(async (lote) => {
    const signed = lote.foto_principal ? await client.storage.from("lote-fotos").createSignedUrl(lote.foto_principal, 3600) : null;
    const foto = signed?.data?.signedUrl?.replace(url, import.meta.env['VITE_SUPABASE_URL']) ?? null;
    return { ...lote, foto };
  }));
});

export const obtenerPasaporte = createServerFn({ method: "GET" }).inputValidator((v: string) => z.string().max(60).parse(v)).handler(async ({ data: codigo }) => {
  if (!/^RM-[A-Z2-9]{6}$/.test(codigo)) return null;
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']; const url = process.env['SUPABASE_URL'];
  if (!key || !url) throw new Error("No pudimos cargar el lote.");
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers); if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization"); headers.set("apikey", key); return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await client.rpc("lote_publico", { p_codigo: codigo });
  if (error) throw new Error("No pudimos cargar el lote. Inténtalo de nuevo.");
  const lote = data?.[0]; if (!lote) return null;
  const fotos = await Promise.all(lote.fotos.map(async (ruta) => {
    const { data: signed } = await client.storage.from("lote-fotos").createSignedUrl(ruta, 3600);
    return signed?.signedUrl?.replace(url, import.meta.env['VITE_SUPABASE_URL']) ?? null;
  }));
  return { ...lote, fotos: fotos.filter((f): f is string => !!f) };
});

export const generarCodigo = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: empresa } = await context.supabase.from("empresas").select("id").eq("id", context.userId).maybeSingle();
  if (!empresa) throw new Error("Completa primero el registro de tu empresa.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const random = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
  const codigo = String(random % 10000).padStart(4, "0");
  const expira_at = new Date(Date.now() + MINUTOS_CODIGO * 60_000).toISOString();
  const { data, error } = await supabaseAdmin.from("codigos_verificacion").insert({ empresa_id: context.userId, codigo, expira_at }).select("id,codigo,expira_at").single();
  if (error) throw new Error("No pudimos generar el código. Inténtalo de nuevo.");
  return data;
});

export const publicarLote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => publicarLoteSchema.parse(v)).handler(async ({ data, context }) => {
  if (new Set(data.fotos.map(f => f.ruta)).size !== data.fotos.length) throw new Error("Usa fotos diferentes del material.");
  const { data: codigo } = await context.supabase.from("codigos_verificacion").select("*").eq("id", data.codigoId).eq("empresa_id", context.userId).maybeSingle();
  if (!codigo || codigo.usado_at || new Date(codigo.expira_at).getTime() <= Date.now()) throw new Error("El código venció. Genera uno nuevo y vuelve a tomar las fotos.");
  for (const foto of data.fotos) {
    if (!foto.ruta.startsWith(`${context.userId}/${data.codigoId}/`) || foto.ruta.includes("..")) throw new Error("Revisa las fotos de este lote.");
    const { data: archivo, error } = await context.supabase.storage.from("lote-fotos").download(foto.ruta);
    if (error || !archivo || archivo.size > MAX_BYTES_FOTO || !(TIPOS_FOTO as readonly string[]).includes(archivo.type)) throw new Error("Cada foto debe ser JPG, PNG o WebP y pesar como máximo 1.5 MB.");
    const bytes = new Uint8Array(await archivo.slice(0, 12).arrayBuffer());
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
    const webp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
    if (!jpeg && !png && !webp) throw new Error("Una foto no tiene un formato de imagen válido.");
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: lote, error } = await supabaseAdmin.rpc("crear_lote_validado", { p_empresa: context.userId, p_datos: data, p_max_activos: MAX_LOTES_ACTIVOS_EMPRESA_NUEVA });
  if (error) {
    if (error.message.includes("hasta") || error.message.includes("código")) throw new Error(error.message);
    throw new Error("No pudimos guardar el lote. Revisa tus datos e inténtalo de nuevo.");
  }
  return lote;
});

export const listarMisLotes = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("lotes").select("*").eq("empresa_id", context.userId).order("created_at", { ascending: false });
  if (error) throw new Error("No pudimos cargar tus lotes.");
  return data;
});

export const retirarLote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v: string) => z.string().uuid().parse(v)).handler(async ({ data: id, context }) => {
  const { data: lote } = await context.supabase.from("lotes").select("id,estado").eq("id", id).eq("empresa_id", context.userId).maybeSingle();
  if (!lote || !["en_revision", "publicado"].includes(lote.estado)) throw new Error("No puedes retirar este lote en su estado actual.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error, data } = await supabaseAdmin.from("lotes").update({ estado: "retirado" }).eq("id", id).eq("empresa_id", context.userId).eq("estado", lote.estado).select("id");
  if (error || !data?.length) throw new Error("El lote cambió. Actualiza la página e inténtalo de nuevo.");
  return { ok: true };
});

export const editarLote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => publicarLoteSchema.pick({ descripcion: true, peso_kg: true, empaque: true, distrito: true }).extend({ id: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  const { id, ...campos } = data;
  const { data: updated, error } = await context.supabase.from("lotes").update(campos).eq("id", id).eq("empresa_id", context.userId).eq("estado", "en_revision").select("id");
  if (error || !updated?.length) throw new Error("Solo puedes editar tus lotes en revisión.");
  return { ok: true };
});

export const listarRevision = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (roleError || !admin) throw new Error("Esta sección es solo para el equipo administrador.");
  const { data, error } = await context.supabase.from("lotes").select("*, lote_fotos(*), empresas(nombre_empresa)").eq("estado", "en_revision").order("created_at");
  if (error) throw new Error("No pudimos cargar la cola de revisión.");
  return Promise.all(data.map(async lote => ({ ...lote, fotos: await Promise.all(lote.lote_fotos.sort((a,b) => a.orden-b.orden).map(async foto => {
    const { data: signed, error } = await context.supabase.storage.from("lote-fotos").createSignedUrl(foto.ruta_storage, 3600);
    if (error) throw new Error("No pudimos cargar una foto.");
    return { ...foto, url: signed.signedUrl.replace(process.env['SUPABASE_URL'] ?? "", import.meta.env['VITE_SUPABASE_URL']) };
  })) })));
});

export const revisarLote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => z.object({ id: z.string().uuid(), aprobar: z.boolean(), motivo: z.string().trim().max(500) }).refine(v => v.aprobar || v.motivo.length > 0, "Indica un motivo para rechazar el lote.").parse(v)).handler(async ({ data, context }) => {
  const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (roleError || !admin) throw new Error("No tienes permiso para revisar lotes.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: updated, error } = await supabaseAdmin.from("lotes").update({ estado: data.aprobar ? "publicado" : "retirado", motivo_rechazo: data.aprobar ? null : data.motivo, ...(data.aprobar ? { publicado_at: new Date().toISOString() } : {}) }).eq("id", data.id).eq("estado", "en_revision").select("id");
  if (error || !updated?.length) throw new Error("El lote ya no está en revisión. Actualiza la lista.");
  if (data.aprobar) await supabaseAdmin.from("reportes_lote").update({ estado: "revisado" }).eq("lote_id", data.id).eq("estado", "abierto");
  return { ok: true };
});

export const reportarLote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => reportarSchema.parse(v)).handler(async ({ data, context }) => {
  const { data: empresa } = await context.supabase.from("empresas").select("id").eq("id", context.userId).maybeSingle();
  if (!empresa) throw new Error("Necesitas una cuenta de empresa para reportar.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.rpc("reportar_lote_validado", { p_empresa: context.userId, p_lote: data.loteId, p_motivo: data.motivo, p_detalle: data.detalle ?? "", p_umbral: REPORTES_PARA_REVISION });
  if (error) {
    if (/propio|Ya reportaste|no está disponible/.test(error.message)) throw new Error(error.message);
    throw new Error("No pudimos enviar el reporte. Inténtalo de nuevo.");
  }
  return { ok: true };
});