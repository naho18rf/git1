import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";

import { SimplePage } from "@/components/site/SimplePage";
import { Button } from "@/components/ui/button";
import { canalesContacto, CONTACTO_CONFIG } from "@/lib/contacto";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto · Remanente" },
      { name: "description", content: "Ponte en contacto con el equipo de Remanente." },
      { property: "og:title", content: "Contacto · Remanente" },
      { property: "og:description", content: "Ponte en contacto con el equipo de Remanente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const canales = canalesContacto(CONTACTO_CONFIG);
  const horario = CONTACTO_CONFIG.horario.trim();

  return (
    <SimplePage
      eyebrow="Contacto"
      title="Conversemos"
      intro={
        canales.length
          ? "Escríbenos por el canal que prefieras: te responderá una persona del equipo."
          : "Nuestros canales de contacto se publicarán muy pronto."
      }
    >
      <div className="surface-card p-8">
        {canales.length > 0 ? (
          <>
            <ul className="space-y-3">
              {canales.map((canal) => (
                <li key={canal.clave}>
                  <a
                    href={canal.href}
                    {...(canal.clave === "whatsapp"
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-flex min-h-11 items-center gap-3 rounded-md text-primary-deep underline-offset-4 hover:text-primary hover:underline"
                  >
                    {canal.clave === "correo" ? (
                      <Mail className="h-5 w-5 text-clay" strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <MessageCircle
                        className="h-5 w-5 text-clay"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    )}
                    <span>
                      <span className="block text-[13px] text-clay">{canal.etiqueta}</span>
                      {canal.valor}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            {horario && <p className="mt-6 text-sm text-muted-foreground">{horario}</p>}
          </>
        ) : (
          <>
            <p className="text-foreground">
              Mientras tanto, puedes registrar tu empresa y te avisaremos cuando el mercado esté
              disponible.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/registro">Registrar empresa</Link>
            </Button>
          </>
        )}
      </div>
    </SimplePage>
  );
}
