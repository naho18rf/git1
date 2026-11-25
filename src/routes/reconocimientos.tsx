import { createFileRoute } from "@tanstack/react-router";
import { Recycle, RefreshCw, Sparkles, Users } from "lucide-react";
import type { ComponentType } from "react";

import { SimplePage } from "@/components/site/SimplePage";

const RECONOCIMIENTOS: { titulo: string; criterio: string; Icono: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean | "true" }> }[] = [
  { titulo: "Mayor desvío de residuos", criterio: "Más kilogramos entregados con constancia.", Icono: Recycle },
  { titulo: "Mejor reúso creativo", criterio: "El uso más original de un residuo como materia prima.", Icono: Sparkles },
  { titulo: "Liderazgo en economía circular", criterio: "Empresas que impulsan prácticas circulares en su cadena.", Icono: RefreshCw },
  { titulo: "Liderazgo de mujeres en la industria", criterio: "Mujeres que lideran empresas o procesos de valorización de residuos.", Icono: Users },
];

export const Route = createFileRoute("/reconocimientos")({
  head: () => ({
    meta: [
      { title: "Reconocimientos de Remanente" },
      { name: "description", content: "Reconocimientos a las empresas que más hacen florecer sus residuos en Remanente." },
      { property: "og:title", content: "Reconocimientos de Remanente" },
      { property: "og:description", content: "Remanente florece: reconocemos a las empresas que más hacen florecer sus residuos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reconocimientos,
});

function Reconocimientos() {
  return (
    <SimplePage
      eyebrow="Reconocimientos"
      title="Remanente florece"
      intro="Cada cierto tiempo reconoceremos a las empresas que más hacen florecer sus residuos. Está abierto a todas las empresas registradas en Remanente."
    >
      <ul className="grid gap-5 sm:grid-cols-2">
        {RECONOCIMIENTOS.map(({ titulo, criterio, Icono }) => (
          <li key={titulo} className="surface-card p-6">
            <div className="flex items-start justify-between gap-3">
              <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-rose-pale text-primary-deep">
                <Icono className="size-5" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span className="rounded-full bg-rose-pale px-3 py-1 text-xs font-medium text-primary">Próximamente</span>
            </div>
            <h2 className="mt-4 font-display text-lg text-primary-deep">{titulo}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{criterio}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted-foreground">
        Aún no hay convocatoria ni ganadores. Los criterios y las fechas se anunciarán más adelante.
      </p>
    </SimplePage>
  );
}
