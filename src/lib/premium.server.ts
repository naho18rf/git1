import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { esPremium } from "./premium-reglas";

/** Las tablas de planes aún no figuran en los tipos generados; Lovable los actualiza al crearlas. */
export const db = () => supabaseAdmin as unknown as SupabaseClient;

export async function empresaEsPremium(empresaId: string) {
  const { data, error } = await db()
    .from("suscripciones")
    .select("plan, vence_at")
    .eq("empresa_id", empresaId)
    .maybeSingle();
  if (error) throw new Error("No pudimos comprobar tu plan.");
  return esPremium(data);
}

/** Si falla, el mercado se muestra igual, sin prioridad. */
export async function idsPremium(): Promise<Set<string>> {
  try {
    const { data } = await db()
      .from("suscripciones")
      .select("empresa_id, plan, vence_at")
      .eq("plan", "premium");
    return new Set((data ?? []).filter((s) => esPremium(s)).map((s) => s.empresa_id as string));
  } catch {
    return new Set();
  }
}
