import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { SimplePage } from "@/components/site/SimplePage";
import { Button } from "@/components/ui/button";
import { CORREOS_EQUIPO } from "@/lib/contacto";

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
  component: () => (
    <SimplePage
      eyebrow="Contacto"
      title="Conversemos"
      intro="Escríbenos a cualquiera de las fundadoras. Te respondemos por correo."
    >
      <ul className="grid gap-5 md:grid-cols-3">
        {CORREOS_EQUIPO.map((p) => (
          <li key={p.correo} className="surface-card p-6">
            <Mail className="h-4 w-4 text-clay" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-3 font-display text-lg text-primary-deep">{p.nombre}</p>
            <a
              href={`mailto:${p.correo}`}
              className="mt-2 block break-all text-sm text-primary underline underline-offset-4"
            >
              {p.correo}
            </a>
          </li>
        ))}
      </ul>
      <div className="surface-card mt-8 p-8">
        <p className="text-foreground">
          ¿Tienes residuos o necesitas materiales? Registra tu empresa y empieza a publicar tus lotes.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/registro">Registrar empresa</Link>
        </Button>
      </div>
    </SimplePage>
  ),
});
