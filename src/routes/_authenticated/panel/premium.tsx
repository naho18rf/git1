import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { fechaLima } from "@/lib/lotes";
import { CLAVES_MATERIALES, nombreCategoria } from "@/lib/materiales";
import { premiumQuery } from "@/lib/premium";
import { datosReporte, guardarAlertas, marcarAlertasVistas } from "@/lib/premium.functions";
import { descargarReportePdf } from "@/lib/reporte-pdf";

export const Route = createFileRoute("/_authenticated/panel/premium")({
  head: () => ({ meta: [{ title: "Premium · Remanente" }] }),
  component: PremiumPage,
});

function PremiumPage() {
  const { user } = Route.useRouteContext();
  const cliente = useQueryClient();
  const { data, isLoading, isError } = useQuery(premiumQuery(user.id));
  const [elegidas, setElegidas] = useState<string[]>([]);
  const guardadas = data?.categorias.join(",") ?? "";
  useEffect(() => setElegidas(guardadas ? guardadas.split(",") : []), [guardadas]);

  const refrescar = () => cliente.invalidateQueries({ queryKey: ["premium", user.id] });
  const guardar = useMutation({
    mutationFn: () =>
      guardarAlertas({ data: { categorias: elegidas as (typeof CLAVES_MATERIALES)[number][] } }),
    onSuccess: () => {
      toast.success("Alertas guardadas");
      void refrescar();
    },
    onError: (e) => toast.error(e.message),
  });
  const vistas = useMutation({ mutationFn: () => marcarAlertasVistas(), onSuccess: refrescar });
  const reporte = useMutation({
    mutationFn: async () => descargarReportePdf(await datosReporte()),
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-muted-foreground">Cargando…</p>;
  if (isError || !data)
    return (
      <p role="alert" className="text-destructive">
        No pudimos cargar esta sección.
      </p>
    );

  if (!data.premium) {
    return (
      <div>
        <h1 className="text-title text-primary-deep">Premium</h1>
        <p className="measure mt-4 text-muted-foreground">
          Con Premium recibes alertas de lotes, tus lotes aparecen primero en el mercado y descargas
          tu reporte de impacto en PDF. Los cobros aún no están activos.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/" hash="como-se-sostiene">
            Ver planes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-title text-primary-deep">Premium</h1>
      <p className="measure mt-2 text-muted-foreground">
        Tus lotes publicados aparecen primero en el mercado.
      </p>

      <section className="surface-card mt-8 p-6">
        <h2 className="text-heading text-primary-deep">Alertas de lotes</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Elige los materiales que te sirven. Los avisos aparecen aquí, dentro de Remanente.
        </p>
        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          {CLAVES_MATERIALES.map((c) => (
            <label key={c} className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={elegidas.includes(c)}
                onChange={(e) =>
                  setElegidas((v) => (e.target.checked ? [...v, c] : v.filter((x) => x !== c)))
                }
              />
              {nombreCategoria(c)}
            </label>
          ))}
        </div>
        <Button className="mt-4" onClick={() => guardar.mutate()} disabled={guardar.isPending}>
          Guardar alertas
        </Button>

        <ul className="mt-6 space-y-3">
          {data.alertas.map((a) => (
            <li key={a.codigo} className="rounded-md border border-border p-4">
              <Link
                to="/lote/$codigo"
                params={{ codigo: a.codigo }}
                className="font-medium text-primary-deep"
              >
                {nombreCategoria(a.categoria)} · {a.peso_kg} kg · {a.distrito}
              </Link>
              {a.nueva && (
                <span className="ml-2 rounded-full bg-rose-pale px-2 py-0.5 text-xs">Nuevo</span>
              )}
              <p className="text-sm text-muted-foreground">{fechaLima(a.publicado_at)}</p>
            </li>
          ))}
        </ul>
        {!data.alertas.length && (
          <p className="mt-4 text-sm text-muted-foreground">Aún no hay lotes que coincidan.</p>
        )}
        {data.nuevas > 0 && (
          <Button variant="outline" className="mt-4" onClick={() => vistas.mutate()}>
            Marcar como vistas
          </Button>
        )}
      </section>

      <section className="surface-card mt-6 p-6">
        <h2 className="text-heading text-primary-deep">Reporte de impacto</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tus entregas completadas, como vendedora o compradora.
        </p>
        <Button className="mt-4" onClick={() => reporte.mutate()} disabled={reporte.isPending}>
          Descargar PDF
        </Button>
      </section>
    </div>
  );
}
