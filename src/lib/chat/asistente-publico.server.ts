import { convertToModelMessages, type UIMessage } from "ai";

import { SYSTEM_PROMPT_PUBLICO } from "./prompt.server.ts";
import { createResponsesCall } from "./responses.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev";
const MODEL = "openai/gpt-6-astra";
const MAX_MENSAJES = 24;
const MAX_CARACTERES = 1500;

/**
 * Reconstruye el historial solo con texto plano: no confiamos en partes
 * enviadas por un visitante anónimo (razonamiento, herramientas, etc.).
 */
function limpiarMensajes(raw: unknown): UIMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MENSAJES) return null;
  const limpios: UIMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { id, role, parts } = m as { id?: unknown; role?: unknown; parts?: unknown };
    if (typeof id !== "string" || id.length > 100) return null;
    if (role !== "user" && role !== "assistant") return null;
    if (!Array.isArray(parts)) return null;
    const texto = parts
      .filter(
        (p): p is { type: "text"; text: string } =>
          !!p && typeof p === "object" && p.type === "text" && typeof p.text === "string",
      )
      .map((p) => p.text)
      .join("\n")
      .trim();
    if (!texto) continue;
    if (role === "user" && texto.length > MAX_CARACTERES) return null;
    limpios.push({ id, role, parts: [{ type: "text", text: texto.slice(0, 4000) }] });
  }
  if (limpios.length === 0 || limpios[limpios.length - 1]?.role !== "user") return null;
  return limpios;
}

export async function handleChatPublico(request: Request): Promise<Response> {
  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const messages = limpiarMensajes(body.messages);
  if (!messages) {
    return Response.json(
      {
        error: `Tu mensaje no se pudo enviar. Escribe máximo ${MAX_CARACTERES} caracteres o empieza una conversación nueva.`,
      },
      { status: 400 },
    );
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    console.error("[chat-publico] Falta LOVABLE_API_KEY");
    return Response.json(
      { error: "El asistente no está disponible en este momento." },
      { status: 500 },
    );
  }

  const call = createResponsesCall(
    request,
    { baseURL: GATEWAY_URL, apiKey, model: MODEL },
    await convertToModelMessages(messages),
    SYSTEM_PROMPT_PUBLICO,
  );
  return call.response({ originalMessages: messages });
}
