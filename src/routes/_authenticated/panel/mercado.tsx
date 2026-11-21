import { createFileRoute } from "@tanstack/react-router";

import { MercadoGrid } from "@/components/lotes/MercadoGrid";

export const Route = createFileRoute("/_authenticated/panel/mercado")({
  head: () => ({ meta: [{ title: "Mercado · Panel · Remanente" }] }),
  component: MercadoPanel,
});

function MercadoPanel() {
  return (
    <div>
      <h1 className="text-title text-primary-deep">Mercado</h1>
      <p className="measure mt-4 text-muted-foreground">
        Lotes publicados por otras empresas. Esta misma lista es la que ve cualquier visitante.
      </p>
      <MercadoGrid />
    </div>
  );
}
