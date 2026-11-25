import { createFileRoute } from "@tanstack/react-router";

import { MercadoGrid } from "@/components/lotes/MercadoGrid";

export const Route = createFileRoute("/_authenticated/panel/mercado")({
  head: () => ({ meta: [
    { title: "Empresas cercanas y lotes · Panel · Remanente" },
    { name: "description", content: "Consulta lotes publicados y empresas cercanas con filtros de distancia desde tu panel de Remanente." },
    { property: "og:title", content: "Empresas cercanas y lotes · Panel · Remanente" },
    { property: "og:description", content: "Encuentra materiales disponibles y ubicaciones distritales de empresas de Lima y Callao." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
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
