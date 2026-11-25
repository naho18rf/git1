import { createFileRoute } from "@tanstack/react-router";

import { MercadoGrid } from "@/components/lotes/MercadoGrid";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/mercado")({
  head: () => {
    const title = "Mercado de lotes · Remanente";
    const description =
      "Explora lotes de merma industrial de Lima y Callao y empresas cercanas con mapa de referencia distrital y filtros de distancia.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: MercadoPage,
});

function MercadoPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-[13px] tracking-[0.16em] text-clay uppercase">Mercado</p>
        <h1 className="mt-3 text-title text-primary-deep md:text-display">Lotes publicados</h1>
        <p className="measure mt-5 text-lead text-muted-foreground">
          Cada lote es un registro de Remanente: foto, categoría, peso aproximado, empaque y distrito. Para
          contactar a la empresa o cerrar un trato necesitas una cuenta de empresa.
        </p>
        <MercadoGrid />
      </div>
    </PageShell>
  );
}
