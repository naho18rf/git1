import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, CircleDashed } from "lucide-react";

import { PANEL_ITEMS } from "@/components/panel/nav";
import { Badge } from "@/components/ui/badge";
import { empresaQuery } from "@/lib/empresa";

export const Route = createFileRoute("/_authenticated/panel/")({
  head: () => ({ meta: [{ title: "Inicio · Panel · Remanente" }] }),
  component: PanelInicio,
});

function PanelInicio() {
  const { user } = Route.useRouteContext();
  const { data: empresa, isLoading } = useQuery(empresaQuery(user.id));

  const perfilCompleto = !!(
    empresa?.nombre_empresa &&
    empresa.ruc &&
    empresa.representante &&
    empresa.telefono &&
    empresa.distrito &&
    empresa.direccion
  );
  const nombre = empresa?.representante?.split(" ")[0];

  const accesos = PANEL_ITEMS.filter((i) => i.to !== "/panel");

  return (
    <div className="space-y-14">
      <section>
        <h1 className="text-title text-primary-deep md:text-display">
          {isLoading ? "Hola" : nombre ? `Hola, ${nombre}` : "Hola"}
        </h1>
        <p className="measure mt-4 text-[17px] text-muted-foreground">
          {empresa?.nombre_empresa ?? "Tu empresa"} · tu cuenta puede publicar mermas y adquirir
          materiales.
        </p>
      </section>

      <section>
        <h2 className="text-heading text-primary-deep">Estado de tu cuenta</h2>
        <ul className="mt-5 divide-y divide-border border-y border-border text-[15px]">
          <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-4">
            {user.email_confirmed_at ? (
              <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
            ) : (
              <CircleDashed className="h-5 w-5 text-clay" strokeWidth={1.5} />
            )}
            {user.email_confirmed_at ? "Correo verificado:" : "Correo sin verificar:"}{" "}
            <span className="min-w-0 break-all text-muted-foreground">{user.email}</span>
          </li>
          <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
            {perfilCompleto ? (
              <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
            ) : (
              <CircleDashed className="h-5 w-5 text-clay" strokeWidth={1.5} />
            )}
            {perfilCompleto ? "Datos de empresa completos" : "Faltan datos de tu empresa"}
            <Link
              to="/panel/perfil"
              className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
            >
              {perfilCompleto ? "Ver perfil" : "Completar"}
            </Link>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-heading text-primary-deep">Accesos</h2>
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {accesos.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="group flex items-center gap-4 py-5 transition-colors hover:bg-surface sm:px-3"
              >
                <item.icon className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.25} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl leading-tight text-primary-deep transition-colors group-hover:text-primary">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{item.descripcion}</span>
                </span>
                {item.disponible ? (
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.5} />
                ) : (
                  <Badge variant="outline" className="shrink-0">Próximamente</Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
