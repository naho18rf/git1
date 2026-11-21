import { createFileRoute } from "@tanstack/react-router";

import { PublicarLoteForm } from "@/components/lotes/PublicarLote";

export const Route = createFileRoute("/_authenticated/panel/publicar")({
  head: () => ({ meta: [{ title: "Publicar lote · Panel · Remanente" }] }),
  component: PublicarPage,
});

function PublicarPage() {
  const { user } = Route.useRouteContext();
  return <PublicarLoteForm userId={user.id} />;
}
