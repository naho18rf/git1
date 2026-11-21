import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { convertToModelMessages, type UIMessage } from "ai";

import type { Database, Json } from "@/integrations/supabase/types";

import { SYSTEM_PROMPT } from "./prompt.server.ts";
import { createResponsesCall } from "./responses.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev";
const MODEL = "openai/gpt-6-astra";
const TITULO_POR_DEFECTO = "Nueva conversación";



function isOpaqueSupabaseKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

/** Las claves nuevas de Supabase son opacas: van en `apikey`, no como Bearer. */
function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (
      isOpaqueSupabaseKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

async function authenticate(
  request: Request,
): Promise<{ supabase: SupabaseClient<Database>; userId: string } | null> {
  const SUPABASE_URL = process.env["SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error("[chat] Faltan SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY");
    return null;
  }
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) return null;

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { supabase, userId: data.claims.sub };
}

function textOf(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join(" ")
    .trim();
}

export async function handleChat(request: Request): Promise<Response> {
  const auth = await authenticate(request);
  if (!auth) {
    return Response.json(
      { error: "Debes iniciar sesión para usar el asistente." },
      { status: 401 },
    );
  }
  const { supabase, userId } = auth;

  let body: { messages?: UIMessage[]; conversacionId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const { messages, conversacionId } = body;
  if (!conversacionId || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Faltan datos de la conversación." }, { status: 400 });
  }

  // Verifica que la conversación pertenece al usuario (RLS también lo impone).
  const { data: conversacion, error: convError } = await supabase
    .from("chat_conversaciones")
    .select("id, titulo")
    .eq("id", conversacionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (convError) {
    console.error("[chat] error al verificar la conversación", convError);
    return Response.json({ error: "No pudimos verificar la conversación." }, { status: 500 });
  }
  if (!conversacion) {
    return Response.json({ error: "Conversación no encontrada." }, { status: 404 });
  }

  // Guarda el último mensaje del usuario (una sola vez, por message_id).
  const ultimo = messages[messages.length - 1];
  if (ultimo?.role === "user") {
    const { data: existente, error: existeError } = await supabase
      .from("chat_mensajes")
      .select("id")
      .eq("conversacion_id", conversacionId)
      .eq("message_id", ultimo.id)
      .maybeSingle();
    if (existeError) {
      console.error("[chat] error al revisar el mensaje", existeError);
      return Response.json({ error: "No pudimos guardar tu mensaje." }, { status: 500 });
    }
    if (!existente) {
      const { error } = await supabase.from("chat_mensajes").insert({
        conversacion_id: conversacionId,
        message_id: ultimo.id,
        role: "user",
        parts: ultimo.parts as unknown as Json,
      });
      if (error) {
        console.error("[chat] error al guardar el mensaje", error);
        return Response.json({ error: "No pudimos guardar tu mensaje." }, { status: 500 });
      }
      if (conversacion.titulo === TITULO_POR_DEFECTO) {
        const titulo = textOf(ultimo).slice(0, 60) || TITULO_POR_DEFECTO;
        await supabase
          .from("chat_conversaciones")
          .update({ titulo, updated_at: new Date().toISOString() })
          .eq("id", conversacionId);
      }
    }
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    console.error("[chat] Falta LOVABLE_API_KEY");
    return Response.json(
      { error: "El asistente no está disponible en este momento." },
      { status: 500 },
    );
  }

  const modelMessages = await convertToModelMessages(messages);
  const call = createResponsesCall(
    request,
    { baseURL: GATEWAY_URL, apiKey, model: MODEL },
    modelMessages,
    SYSTEM_PROMPT,
  );

  return call.response({
    originalMessages: messages,
    onFinish: async ({ responseMessage }) => {
      const { error } = await supabase.from("chat_mensajes").insert({
        conversacion_id: conversacionId,
        message_id: responseMessage.id,
        role: "assistant",
        parts: responseMessage.parts as unknown as Json,
      });
      if (error) console.error("[chat] no se pudo guardar la respuesta", error);
      await supabase
        .from("chat_conversaciones")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversacionId);
    },
  });
}
