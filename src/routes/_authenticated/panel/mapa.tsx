import { createFileRoute } from "@tanstack/react-router";

import { MapaSimbiosis } from "@/components/mapa/MapaSimbiosis";

export const Route = createFileRoute("/_authenticated/panel/mapa")({
  head: () => ({ meta: [{ title: "Mapa · Remanente" }] }),
  component: MapaSimbiosis,
});
