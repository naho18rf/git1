import { createFileRoute } from "@tanstack/react-router";

import { MapaSimbiosis } from "@/components/mapa/MapaSimbiosis";

export const Route = createFileRoute("/_authenticated/panel/mapa")({
  head: () => ({ meta: [{ title: "Mapa · Remanente" }] }),
  component: () => (
    <div>
      <p role="note" className="mb-6 rounded-md bg-rose-pale px-5 py-4 text-sm text-foreground">
        Vista ilustrativa: los puntos son referenciales, no empresas registradas.
      </p>
      <MapaSimbiosis />
    </div>
  ),
});
