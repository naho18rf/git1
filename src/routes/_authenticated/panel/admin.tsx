import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";

import { ColaRevision } from "@/components/lotes/ColaRevision";
import { ProblemasEntrega } from "@/components/tratos/ProblemasEntrega";
import { esAdminQuery } from "@/lib/empresa";

export const Route = createFileRoute("/_authenticated/panel/admin")({
  head: () => ({ meta: [{ title: "Admin · Remanente" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = Route.useRouteContext();
  const { data: esAdmin, isLoading } = useQuery(esAdminQuery(user.id));

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Verificando permisos…
      </p>
    );
  }

  if (!esAdmin) {
    return (
      <div>
        <h1 className="text-title text-primary-deep">Acceso restringido</h1>
        <div className="surface-card mt-10 flex max-w-2xl items-start gap-3 p-7 md:p-8">
          <Lock className="mt-1 h-4 w-4 shrink-0 text-clay" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-muted-foreground">
            Esta sección es solo para el equipo administrador de Remanente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-title text-primary-deep">Lotes en revisión</h1>
      <p className="measure mt-4 text-muted-foreground">
        Aprueba o rechaza los lotes que llegaron. Al aprobar, el lote se muestra en el mercado; al rechazar,
        la empresa ve el motivo.
      </p>
      <ColaRevision />
      <section className="mt-14" aria-labelledby="problemas-entrega">
        <h2 id="problemas-entrega" className="font-display text-2xl text-primary-deep">Entregas con problema</h2>
        <p className="measure mt-2 text-muted-foreground">Tratos que la empresa compradora no confirmó porque algo no salió bien. No se emite constancia hasta resolverlos.</p>
        <ProblemasEntrega />
      </section>
    </div>
  );
}
