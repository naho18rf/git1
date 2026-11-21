import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "@/components/panel/ComingSoon";

export const Route = createFileRoute("/_authenticated/panel/mapa")({
  head: () => ({ meta: [{ title: "Mapa · Remanente" }] }),
  component: () => <ComingSoon path="/panel/mapa" />,
});
