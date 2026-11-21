import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { PANEL_ITEMS } from "@/components/panel/nav";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/lib/auth";
import { empresaQuery } from "@/lib/empresa";
import { misTratosQuery } from "@/lib/tratos";
import { contarPendientes } from "@/lib/tratos-reglas";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Panel · Remanente" },
      { name: "description", content: "Área privada de tu empresa en Remanente." },
      { property: "og:title", content: "Panel · Remanente" },
      { property: "og:description", content: "Área privada de tu empresa en Remanente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanelLayout,
});

function PanelLayout() {
  const { user } = Route.useRouteContext();
  const { data: empresa } = useQuery(empresaQuery(user.id));
  const signOut = useSignOut();
  const { data: tratos = [] } = useQuery(misTratosQuery(user.id));
  const pendientes = contarPendientes(tratos);
  const badge = (to: string, className: string) =>
    to === "/panel/tratos" && pendientes > 0 ? (
      <span className={className}>
        {pendientes}
        <span className="sr-only"> {pendientes === 1 ? "trato espera tu respuesta" : "tratos esperan tu respuesta"}</span>
      </span>
    ) : null;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Barra lateral (escritorio) */}
      <aside className="hidden border-r border-border bg-surface lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-6">
          <Logo to="/panel" />
          <div className="mt-8 border-y border-border py-4">
            <p className="text-[13px] text-clay">Empresa</p>
            <p className="mt-0.5 truncate font-display text-xl leading-tight text-primary-deep">
              {empresa?.nombre_empresa ?? user.email}
            </p>
          </div>
          <nav className="mt-6 flex flex-1 flex-col gap-0.5" aria-label="Panel">
            {PANEL_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                className="group flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:text-primary data-[status=active]:bg-mint data-[status=active]:font-medium data-[status=active]:text-primary"
              >
                <item.icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {badge(item.to, "grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground")}
                {!item.disponible && (
                  <span className="text-xs text-muted-foreground">Pronto</span>
                )}
              </Link>
            ))}
          </nav>
          <Button variant="ghost" className="justify-start px-3" onClick={signOut}>
            <LogOut strokeWidth={1.5} /> Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Barra superior (móvil) */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface lg:hidden">
        <div className="flex h-16 items-center justify-between px-5">
          <Logo to="/panel" />
          <Button variant="ghost" size="sm" onClick={signOut} aria-label="Cerrar sesión">
            <LogOut strokeWidth={1.5} /> Salir
          </Button>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-5 pb-3" aria-label="Panel móvil">
          {PANEL_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] text-muted-foreground transition-colors hover:text-primary data-[status=active]:border-primary/30 data-[status=active]:bg-mint data-[status=active]:text-primary"
            >
              <item.icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              {item.label}
              {badge(item.to, "grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground")}
            </Link>
          ))}
        </nav>
      </header>

      <main className="min-w-0 px-5 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
