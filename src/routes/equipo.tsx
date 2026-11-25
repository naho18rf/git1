import { createFileRoute } from "@tanstack/react-router";

import { SimplePage } from "@/components/site/SimplePage";

const FUNDADORAS = [
  { nombre: "Nahomi Kamyla Rojas Fernández", carrera: "Ingeniería de Software", iniciales: "NR" },
  { nombre: "Dulce Belen Ormeño Polo", carrera: "Ingeniería de Software", iniciales: "DO" },
  { nombre: "Geraldine Nicole Torres Jiménez", carrera: "Ingeniería de Inteligencia Artificial", iniciales: "GT" },
];

export const Route = createFileRoute("/equipo")({
  head: () => ({
    meta: [
      { title: "Fundadoras de Remanente" },
      { name: "description", content: "Conoce a las fundadoras de Remanente, estudiantes de ingeniería de la UNI." },
      { property: "og:title", content: "Fundadoras de Remanente" },
      { property: "og:description", content: "El equipo detrás de Remanente, economía circular entre empresas de Lima y Callao." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Equipo,
});

function Equipo() {
  return (
    <SimplePage
      eyebrow="Equipo"
      title="Fundadoras de Remanente"
      intro="Somos estudiantes de ingeniería de la Universidad Nacional de Ingeniería. Creamos Remanente para que los residuos de la industria vuelvan a ser recurso, con trazabilidad y confianza. Creemos en una industria donde el talento de las mujeres tenga el mismo espacio que el de todos."
    >
      <ul className="grid gap-5 sm:grid-cols-2">
        {FUNDADORAS.map((f) => (
          <li key={f.nombre} className="surface-card p-6">
            <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-rose-pale font-display text-lg text-primary-deep">
              {f.iniciales}
            </span>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-primary">Fundadora y representante</p>
            <h2 className="mt-2 font-display text-lg text-primary-deep">{f.nombre}</h2>
            <p className="text-sm text-muted-foreground">{f.carrera}</p>
            <p className="text-sm text-muted-foreground">Universidad Nacional de Ingeniería</p>
          </li>
        ))}
      </ul>
    </SimplePage>
  );
}
