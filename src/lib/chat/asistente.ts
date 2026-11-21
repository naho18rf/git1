import { queryOptions } from "@tanstack/react-query";
import type { UIMessage } from "ai";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const MENSAJE_BIENVENIDA =
  "¡Hola! Soy el asistente de Remanente. Te ayudo a que lo que sobra en tu planta vuelva a florecer: publicar tu merma, entender el pasaporte del lote o resolver dudas sobre el certificado. ¿Por dónde empezamos?";

export type Conversacion = Pick<
  Tables<"chat_conversaciones">,
  "id" | "titulo" | "created_at" | "updated_at"
>;

export const conversacionesQuery = queryOptions({
  queryKey: ["chat", "conversaciones"],
  queryFn: async (): Promise<Conversacion[]> => {
    const { data, error } = await supabase
      .from("chat_conversaciones")
      .select("id, titulo, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const mensajesQuery = (conversacionId: string) =>
  queryOptions({
    queryKey: ["chat", "mensajes", conversacionId],
    queryFn: async (): Promise<UIMessage[]> => {
      const { data, error } = await supabase
        .from("chat_mensajes")
        .select("id, message_id, role, parts")
        .eq("conversacion_id", conversacionId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data.map((m) => ({
        id: m.message_id ?? m.id,
        role: m.role as UIMessage["role"],
        parts: m.parts as unknown as UIMessage["parts"],
      }));
    },
  });

/** Crea una conversación con el mensaje de bienvenida y devuelve su id. */
export async function crearConversacion(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sin sesión");
  const { data, error } = await supabase
    .from("chat_conversaciones")
    .insert({ user_id: user.id })
    .select("id")
    .single();
  if (error) throw error;
  const { error: msgError } = await supabase.from("chat_mensajes").insert({
    conversacion_id: data.id,
    role: "assistant",
    parts: [{ type: "text", text: MENSAJE_BIENVENIDA }],
  });
  if (msgError) throw msgError;
  return data.id;
}

export async function eliminarConversacion(id: string): Promise<void> {
  const { error } = await supabase.from("chat_conversaciones").delete().eq("id", id);
  if (error) throw error;
}

export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}
