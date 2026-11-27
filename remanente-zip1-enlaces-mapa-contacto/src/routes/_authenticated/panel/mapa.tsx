import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { MapaEmpresasCercanas } from "@/components/lotes/MapaEmpresasCercanas";
import { Button } from "@/components/ui/button";
import { mercadoQuery } from "@/lib/lotes";

export const Route = createFileRoute("/_authenticated/panel/mapa")({
  head: () => ({ meta: [{ title: "Mapa · Remanente" }] }),
  component: MapaPage,
});

function MapaPage() {
  const { data: lotes = [], isLoading, error } = useQuery(mercadoQuery);

  return (
    <div>
      <h1 className="text-title text-primary-deep">Mapa</h1>
      <p className="measure mt-2 text-muted-foreground">
        Empresas que tienen lotes publicados en el mercado ahora mismo, ordenadas por cercanía. Es
        una referencia por distrito, no la dirección exacta de la sede.
      </p>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Cargando empresas…</p>
      ) : error ? (
        <p role="alert" className="mt-8 text-destructive">
          No pudimos cargar el mapa. Inténtalo de nuevo.
        </p>
      ) : (
        <MapaEmpresasCercanas lotes={lotes} />
      )}

      <Button variant="outline" className="mt-8" asChild>
        <Link to="/panel/mercado">Ver el mercado</Link>
      </Button>
    </div>
  );
}
