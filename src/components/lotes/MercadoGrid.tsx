import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { HandHeart, Package, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { mercadoQuery, fechaLima } from "@/lib/lotes";
import { nombreCategoria } from "@/lib/materiales";
import { puedeSolicitarLote } from "@/lib/tratos-reglas";
import { filtrarLotes, hayFiltroActivo, opcionesFiltro, SIN_FILTRO, type FiltroLotes } from "@/lib/lotes-filtro";

const selectClass = "h-11 w-full rounded-md border border-input bg-surface px-3 text-sm sm:w-64";

export function MercadoGrid() {
  const { data: lotes = [], isLoading, error } = useQuery(mercadoQuery);
  const { session } = useAuth();
  const [filtro, setFiltro] = useState<FiltroLotes>({ categoria: SIN_FILTRO, distrito: SIN_FILTRO });

  const visibles = filtrarLotes(lotes, filtro);
  const { categorias, distritos } = opcionesFiltro(lotes);

  // El mercado solo lista lotes publicados; falta saber si el lote es de la empresa con sesión.
  const puedePedir = (empresaId: string) =>
    puedeSolicitarLote({
      tieneSesion: !!session,
      esDueno: !!session && empresaId === session.user.id,
      estado: "publicado",
    });

  if (isLoading) return <p className="mt-8 text-muted-foreground">Cargando lotes publicados…</p>;
  if (error) return <p role="alert" className="mt-8 text-destructive">No pudimos cargar el mercado. Inténtalo de nuevo.</p>;

  if (!lotes.length) {
    return (
      <div className="surface-card mt-8 flex flex-col items-start gap-4 p-8">
        <Store className="h-6 w-6 text-clay" strokeWidth={1.5} aria-hidden="true" />
        <h2 className="font-display text-2xl text-primary-deep">Aún no hay lotes publicados</h2>
        <p className="measure text-muted-foreground">
          Cuando una empresa publique su merma, aparecerá aquí con su foto, su peso aproximado y su distrito.
        </p>
        <Button asChild>
          <Link to="/registro">Registrar mi empresa</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end gap-4 border-y border-border py-5">
        <div>
          <label htmlFor="filtro-categoria" className="block text-sm font-medium">
            Categoría
          </label>
          <select
            id="filtro-categoria"
            className={`mt-2 ${selectClass}`}
            value={filtro.categoria}
            onChange={(e) => setFiltro((f) => ({ ...f, categoria: e.target.value }))}
          >
            <option value={SIN_FILTRO}>Todas las categorías</option>
            {categorias.map((clave) => (
              <option key={clave} value={clave}>
                {nombreCategoria(clave)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-distrito" className="block text-sm font-medium">
            Distrito
          </label>
          <select
            id="filtro-distrito"
            className={`mt-2 ${selectClass}`}
            value={filtro.distrito}
            onChange={(e) => setFiltro((f) => ({ ...f, distrito: e.target.value }))}
          >
            <option value={SIN_FILTRO}>Todos los distritos</option>
            {distritos.map((distrito) => (
              <option key={distrito} value={distrito}>
                {distrito}
              </option>
            ))}
          </select>
        </div>
        <p className="min-h-11 flex-1 self-center text-sm text-muted-foreground" aria-live="polite">
          {visibles.length} {visibles.length === 1 ? "lote" : "lotes"}
        </p>
        {hayFiltroActivo(filtro) && (
          <Button variant="ghost" className="min-h-11" onClick={() => setFiltro({ categoria: SIN_FILTRO, distrito: SIN_FILTRO })}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {!visibles.length ? (
        <div className="surface-card mt-8 p-8">
          <h2 className="font-display text-2xl text-primary-deep">No hay lotes con esos filtros</h2>
          <p className="measure mt-2 text-muted-foreground">
            Prueba con otra categoría o distrito, o limpia los filtros para ver todo el mercado.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => setFiltro({ categoria: SIN_FILTRO, distrito: SIN_FILTRO })}>
            Ver todos los lotes
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((lote) => (
            <li key={lote.codigo} className="surface-card flex h-full flex-col overflow-hidden">
              <Link
                to="/lote/$codigo"
                params={{ codigo: lote.codigo }}
                className="group block flex-1 transition-shadow hover:shadow-paper"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-mint">
                  {lote.foto ? (
                    <img
                      src={lote.foto}
                      alt={`Foto de ${nombreCategoria(lote.categoria)} publicado por ${lote.nombre_empresa}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center" aria-hidden="true">
                      <Package className="h-8 w-8 text-clay" strokeWidth={1.25} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[13px] tracking-[0.16em] text-clay uppercase">{nombreCategoria(lote.categoria)}</p>
                  <p className="mt-2 font-display text-xl leading-tight text-primary-deep">
                    {lote.peso_kg} kg aprox. · {lote.distrito}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {lote.nombre_empresa} · {fechaLima(lote.publicado_at)} (Lima)
                  </p>
                </div>
              </Link>
              {puedePedir(lote.empresa_id) && (
                <div className="border-t border-border p-5 pt-4">
                  <Button size="sm" className="w-full" asChild>
                    <Link to="/lote/$codigo" params={{ codigo: lote.codigo }} search={{ solicitar: 1 }}>
                      <HandHeart strokeWidth={1.5} /> Solicitar este lote
                    </Link>
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
