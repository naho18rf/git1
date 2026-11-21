import { createFileRoute, Link } from "@tanstack/react-router";

import { SimplePage } from "@/components/site/SimplePage";
import { Button } from "@/components/ui/button";

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
      intro="Nuestros canales de contacto se publicarán muy pronto."
    >
      <div className="surface-card p-8">
        <p className="text-foreground">
          Mientras tanto, puedes registrar tu empresa y te avisaremos cuando el mercado esté
          disponible.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/registro">Registrar empresa</Link>
        </Button>
      </div>
    </SimplePage>
  ),
});
