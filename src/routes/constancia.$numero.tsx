import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site/PageShell";
import { fechaLima } from "@/lib/lotes";
import { nombreCategoria } from "@/lib/materiales";
import { constanciaQuery } from "@/lib/tratos";

export const Route = createFileRoute("/constancia/$numero")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(constanciaQuery(params.numero)),
  head: ({ params }) => {
    const title = `Constancia ${params.numero.toUpperCase()} · Remanente`;
    const description = "Verifica una constancia de entrega registrada en Remanente.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: ConstanciaPage,
});

function ConstanciaPage() {
  const { numero } = Route.useParams();
  const { data: c } = useSuspenseQuery(constanciaQuery(numero));
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-[13px] tracking-[0.16em] text-clay uppercase">Verificación de constancia</p>
        {!c ? (
          <>
            <h1 className="mt-3 flex items-center gap-3 text-title text-primary-deep"><CircleAlert className="h-8 w-8 text-clay" aria-hidden="true" /> No encontrada</h1>
            <p className="mt-5 text-muted-foreground">No hay ninguna constancia registrada en Remanente con el número {numero.toUpperCase()}.</p>
            <Button asChild variant="outline" className="mt-6"><Link to="/">Volver al inicio</Link></Button>
          </>
        ) : (
          <>
            <h1 className="mt-3 flex items-center gap-3 text-title text-primary-deep"><BadgeCheck className="h-8 w-8 text-primary" aria-hidden="true" /> Constancia registrada en Remanente</h1>
            <dl className="mt-8 grid gap-5 border-y border-border py-6 sm:grid-cols-2">
              {([["Número", c.numero], ["Emitida (hora de Lima)", fechaLima(c.emitida_at)], ["Empresa que entrega", c.vendedora ?? "—"], ["Empresa que recibe", c.compradora ?? "—"], ["Categoría", nombreCategoria(c.categoria ?? "")], ["Peso aproximado", `${c.peso_kg} kg`], ["Integridad del registro", c.hash_valido ? "La huella coincide con el registro original" : "La huella no coincide"]] as [string, string][]).map(([k, v]) => (
                <div key={k}><dt className="text-sm text-muted-foreground">{k}</dt><dd className="mt-1">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-muted-foreground">Constancia de entrega registrada en Remanente. No es un contrato ni una certificación ambiental oficial, y no reemplaza documentos legales ni tributarios.</p>
          </>
        )}
      </div>
    </PageShell>
  );
}
