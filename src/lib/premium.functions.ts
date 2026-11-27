import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calcularImpacto } from "./factores-impacto";
import { CLAVES_MATERIALES } from "./materiales";

const SOLO_PREMIUM = "Esta función es del plan Premium.";
const DIAS_ALERTA = 30;

export const obtenerPremium = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { db, empresaEsPremium } = await import("./premium.server");
    if (!(await empresaEsPremium(context.userId)))
      return { premium: false as const, categorias: [] as string[], alertas: [], nuevas: 0 };
    const { data: pref, error } = await db()
      .from("alertas_preferencias")
      .select("categorias, vistas_at")
      .eq("empresa_id", context.userId)
      .maybeSingle();
    if (error) throw new Error("No pudimos cargar tus alertas.");
    const categorias: string[] = pref?.categorias ?? [];
    let alertas: {
      codigo: string;
      categoria: string;
      distrito: string;
      peso_kg: number;
      publicado_at: string;
      nueva: boolean;
    }[] = [];
    if (categorias.length) {
      const desde = new Date(Date.now() - DIAS_ALERTA * 86_400_000).toISOString();
      const { data, error: e } = await db()
        .from("lotes")
        .select("codigo, categoria, distrito, peso_kg, publicado_at")
        .eq("estado", "publicado")
        .neq("empresa_id", context.userId)
        .in("categoria", categorias)
        .gte("publicado_at", desde)
        .order("publicado_at", { ascending: false })
        .limit(50);
      if (e) throw new Error("No pudimos cargar tus alertas.");
      const vistas = new Date(pref?.vistas_at ?? 0);
      alertas = (data ?? []).map((l) => ({
        ...(l as Omit<(typeof alertas)[number], "nueva">),
        nueva: new Date(l.publicado_at) > vistas,
      }));
    }
    return {
      premium: true as const,
      categorias,
      alertas,
      nuevas: alertas.filter((a) => a.nueva).length,
    };
  });

export const guardarAlertas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z
      .object({ categorias: z.array(z.enum(CLAVES_MATERIALES)).max(CLAVES_MATERIALES.length) })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { db, empresaEsPremium } = await import("./premium.server");
    if (!(await empresaEsPremium(context.userId))) throw new Error(SOLO_PREMIUM);
    const { error } = await db()
      .from("alertas_preferencias")
      .upsert({ empresa_id: context.userId, categorias: data.categorias });
    if (error) throw new Error("No pudimos guardar tus alertas.");
    return { ok: true };
  });

export const marcarAlertasVistas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { db } = await import("./premium.server");
    await db()
      .from("alertas_preferencias")
      .update({ vistas_at: new Date().toISOString() })
      .eq("empresa_id", context.userId);
    return { ok: true };
  });

export const datosReporte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { db, empresaEsPremium } = await import("./premium.server");
    if (!(await empresaEsPremium(context.userId))) throw new Error(SOLO_PREMIUM);
    const uid = context.userId;
    const [empresa, ops] = await Promise.all([
      db().from("empresas").select("nombre_empresa").eq("id", uid).maybeSingle(),
      db()
        .from("operaciones")
        .select(
          "kg_desviados, completada_at, constancias(numero), lotes(categoria)",
        )
        .eq("estado", "completada")
        .or(`empresa_vendedora_id.eq.${uid},empresa_compradora_id.eq.${uid}`)
        .order("completada_at"),
    ]);
    if (empresa.error || ops.error) throw new Error("No pudimos preparar tu reporte.");
    return {
      empresa: (empresa.data?.nombre_empresa as string | null) ?? "Mi empresa",
      filas: (ops.data ?? []).map((o) => {
        const c = Array.isArray(o.constancias)
          ? o.constancias[0]
          : (o.constancias as { numero: string } | null);
        const lote = Array.isArray(o.lotes) ? o.lotes[0] : o.lotes;
        const kg = Number(o.kg_desviados);
        const r = calcularImpacto([{ categoria: (lote?.categoria as string | undefined) ?? null, kg }]);
        return {
          fecha: o.completada_at as string | null,
          constancia: (c?.numero as string | undefined) ?? "—",
          kg_desviados: kg,
          co2e_evitado_kg: r.co2e,
          agua_ahorrada_l: r.agua,
        };
      }),
    };
  });

async function exigirAdmin(context: {
  userId: string;
  supabase: {
    rpc: (
      f: "has_role",
      a: { _user_id: string; _role: "admin" },
    ) => PromiseLike<{ data: boolean | null }>;
  };
}) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Esta sección es solo para el equipo administrador.");
}

export const listarPlanes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirAdmin(context);
    const { db } = await import("./premium.server");
    const [empresas, subs] = await Promise.all([
      db().from("empresas").select("id, nombre_empresa, correo").order("nombre_empresa"),
      db().from("suscripciones").select("empresa_id, plan, vence_at"),
    ]);
    if (empresas.error || subs.error) throw new Error("No pudimos cargar los planes.");
    const porId = new Map((subs.data ?? []).map((s) => [s.empresa_id as string, s]));
    return (empresas.data ?? []).map((e) => ({
      id: e.id as string,
      nombre: (e.nombre_empresa as string | null) ?? (e.correo as string | null) ?? "Empresa",
      plan: (porId.get(e.id)?.plan as string | undefined) ?? "gratis",
    }));
  });

export const asignarPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z
      .object({ empresaId: z.string().uuid(), plan: z.enum(["gratis", "basico", "premium"]) })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    await exigirAdmin(context);
    const { db } = await import("./premium.server");
    const { error } = await db()
      .from("suscripciones")
      .upsert({
        empresa_id: data.empresaId,
        plan: data.plan,
        vence_at: null,
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error("No pudimos guardar el plan.");
    return { ok: true };
  });
