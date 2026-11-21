import { createFileRoute } from "@tanstack/react-router";

import { handleChatPublico } from "@/lib/chat/asistente-publico.server";

// Público a propósito: visitantes sin sesión. No lee ni guarda datos privados;
// el manejador limita tamaño e historial y solo acepta texto.
export const Route = createFileRoute("/api/public/asistente")({
  server: {
    handlers: {
      POST: ({ request }) => handleChatPublico(request),
    },
  },
});
