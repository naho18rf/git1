import { useChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

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
import { BotonNuevaConversacion, ListaConversaciones } from "@/components/chat/ListaConversaciones";
import { supabase } from "@/integrations/supabase/client";
import { mensajesQuery } from "@/lib/chat/asistente";

export const Route = createFileRoute("/_authenticated/panel/asistente/$conversacionId")({
  head: () => ({ meta: [{ title: "Asistente · Remanente" }] }),
  component: ConversacionPage,
});

function ConversacionPage() {
  const { conversacionId } = Route.useParams();
  const { data: mensajes, isLoading, isError } = useQuery(mensajesQuery(conversacionId));

  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
      <aside className="mb-6 space-y-4 lg:mb-0">
        <BotonNuevaConversacion className="w-full lg:w-auto" />
        <ListaConversaciones activeId={conversacionId} />
      </aside>

      <section aria-label="Conversación con el asistente" className="min-w-0">
        {isLoading ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando conversación…
          </p>
        ) : isError ? (
          <p
            className="rounded-md border border-destructive/40 bg-surface px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            No pudimos cargar la conversación. Recarga la página.
          </p>
        ) : !mensajes?.length ? (
          <div className="surface-card p-8 text-center">
            <p className="text-foreground">No encontramos esta conversación.</p>
            <Link
              to="/panel/asistente"
              className="mt-3 inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
            >
              Volver a mis conversaciones
            </Link>
          </div>
        ) : (
          <ChatWindow
            key={conversacionId}
            conversacionId={conversacionId}
            initialMessages={mensajes}
          />
        )}
      </section>
    </div>
  );
}

function ChatWindow({
  conversacionId,
  initialMessages,
}: {
  conversacionId: string;
  initialMessages: UIMessage[];
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { conversacionId },
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
        },
      }),
    [conversacionId],
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: conversacionId,
    messages: initialMessages,
    transport,
    onError: (error) => {
      console.error("[chat]", error);
      toast.error("No pudimos enviar tu mensaje. Inténtalo de nuevo.");
    },
  });

  const ocupado = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-[calc(100dvh-20rem)] min-h-[26rem] flex-col lg:h-[calc(100dvh-10rem)]">
      <Conversation className="flex-1">
        <ConversationContent className="gap-6 px-1">
          {messages.map((m) => {
            const textos = m.parts.filter((p) => p.type === "text");
            if (!textos.length) return null;
            return (
              <Message key={m.id} from={m.role}>
                {m.role === "assistant" && (
                  <img
                    src={flor}
                    alt=""
                    width={816}
                    height={816}
                    loading="lazy"
                    className="h-8 w-8 object-contain"
                  />
                )}
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
              <img
                src={flor}
                alt=""
                width={816}
                height={816}
                loading="lazy"
                className="h-8 w-8 object-contain"
              />
              <MessageContent>
                <Shimmer className="text-sm">Pensando…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        className="mt-4"
        onSubmit={({ text }) => {
          const limpio = text.trim();
          if (limpio && !ocupado) void sendMessage({ text: limpio });
        }}
      >
        <PromptInputTextarea
          autoFocus
          disabled={ocupado}
          placeholder="Escribe tu pregunta sobre Remanente…"
          aria-label="Escribe tu mensaje"
        />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit status={status} onStop={stop} disabled={ocupado ? false : undefined} />
        </PromptInputFooter>
      </PromptInput>
      <p className="mt-2 text-xs text-muted-foreground">
        El asistente es automático y puede equivocarse. Para temas de acuerdos o pagos, escríbenos
        desde Contacto.
      </p>
    </div>
  );
}
