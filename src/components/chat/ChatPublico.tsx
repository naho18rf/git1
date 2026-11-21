import { useChat } from "@ai-sdk/react";
import { Link } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useMemo } from "react";

import flor from "@/assets/asistente-flor.png";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useAuth } from "@/lib/auth";
import { MENSAJE_BIENVENIDA } from "@/lib/chat/asistente";

const BIENVENIDA: UIMessage = {
  id: "bienvenida",
  role: "assistant",
  parts: [{ type: "text", text: MENSAJE_BIENVENIDA }],
};

function Avatar() {
  return (
    <img
      src={flor}
      alt=""
      width={816}
      height={816}
      loading="lazy"
      className="h-8 w-8 shrink-0 object-contain"
    />
  );
}

export default function ChatPublico() {
  const { session } = useAuth();
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/public/asistente" }), []);
  const { messages, sendMessage, status, stop, error } = useChat({
    id: "asistente-publico",
    messages: [BIENVENIDA],
    transport,
    onError: (e) => console.error("[chat-publico]", e),
  });
  const ocupado = status === "submitted" || status === "streaming";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-5 px-1">
          {messages.map((m) => {
            const textos = m.parts.filter((p) => p.type === "text");
            if (!textos.length) return null;
            return (
              <Message key={m.id} from={m.role}>
                {m.role === "assistant" && <Avatar />}
                <MessageContent className="group-[.is-user]:rounded-2xl group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                  {textos.map((p, i) =>
                    m.role === "assistant" ? (
                      <MessageResponse key={i}>{p.text}</MessageResponse>
                    ) : (
                      <p key={i} className="whitespace-pre-wrap">
                        {p.text}
                      </p>
                    ),
                  )}
                </MessageContent>
              </Message>
            );
          })}
          {status === "submitted" && (
            <Message from="assistant">
              <Avatar />
              <MessageContent>
                <Shimmer className="text-sm">Pensando…</Shimmer>
              </MessageContent>
            </Message>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-surface px-3 py-2 text-sm text-destructive"
            >
              No pudimos responder en este momento. Inténtalo de nuevo en unos minutos.
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        className="mt-3"
        onSubmit={({ text }) => {
          const limpio = text.trim();
          if (limpio && !ocupado) void sendMessage({ text: limpio });
        }}
      >
        <PromptInputTextarea
          autoFocus
          maxLength={1500}
          disabled={ocupado}
          placeholder="Escribe tu pregunta sobre Remanente…"
          aria-label="Escribe tu mensaje"
        />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit status={status} onStop={stop} disabled={ocupado ? false : undefined} />
        </PromptInputFooter>
      </PromptInput>

      {session ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Esta conversación no se guarda. Tus conversaciones guardadas están en{" "}
          <Link to="/panel/asistente" className="font-medium text-primary underline-offset-4 hover:underline">
            Mi panel
          </Link>
          .
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Para publicar o adquirir merma necesitas una cuenta de empresa:{" "}
          <Link to="/auth" className="font-medium text-primary underline-offset-4 hover:underline">
            Ingresar
          </Link>{" "}
          o{" "}
          <Link to="/registro" className="font-medium text-primary underline-offset-4 hover:underline">
            Registrar mi empresa
          </Link>
          . Esta conversación no se guarda.
        </p>
      )}
    </div>
  );
}
