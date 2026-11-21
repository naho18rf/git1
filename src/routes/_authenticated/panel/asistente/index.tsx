import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import flor from "@/assets/asistente-flor.png";
import { BotonNuevaConversacion } from "@/components/chat/ListaConversaciones";
import { conversacionesQuery, fechaCorta } from "@/lib/chat/asistente";

export const Route = createFileRoute("/_authenticated/panel/asistente/")({
  head: () => ({ meta: [{ title: "Asistente · Remanente" }] }),
  component: AsistenteInicio,
});

function AsistenteInicio() {
  const { data: conversaciones, isLoading } = useQuery(conversacionesQuery);

  return (
    <div className="space-y-10">
      <section className="flex items-start gap-5">
        <img
          src={flor}
          alt=""
          width={816}
          height={816}
          loading="lazy"
          className="h-16 w-16 shrink-0 object-contain"
        />
        <div>
          <h1 className="text-title text-primary-deep">Asistente de Remanente</h1>
          <p className="measure mt-3 text-[17px] text-muted-foreground">
            Te ayudo a publicar tu merma, entender el pasaporte del lote y resolver dudas sobre el
            certificado. Soy un asistente automático, no una persona.
          </p>
        </div>
      </section>

      <BotonNuevaConversacion />

      <section>
        <h2 className="text-heading text-primary-deep">Tus conversaciones</h2>
        {isLoading ? (
          <p className="mt-5 text-sm text-muted-foreground">Cargando…</p>
        ) : !conversaciones?.length ? (
          <p className="measure mt-5 text-[15px] text-muted-foreground">
            Aún no tienes conversaciones. Empieza una y te acompaño paso a paso.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-border border-y border-border">
            {conversaciones.map((c) => (
              <li key={c.id}>
                <Link
                  to="/panel/asistente/$conversacionId"
                  params={{ conversacionId: c.id }}
                  className="group flex items-center gap-4 py-4 transition-colors hover:bg-surface sm:px-3"
                >
                  <MessageCircle
                    className="h-5 w-5 shrink-0 text-primary"
                    strokeWidth={1.25}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg leading-tight text-primary-deep transition-colors group-hover:text-primary">
                      {c.titulo}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {fechaCorta(c.updated_at)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
