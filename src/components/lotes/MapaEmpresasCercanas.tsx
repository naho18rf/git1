import { useState } from "react";
import { LocateFixed, MapPin, Navigation, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nombreCategoria } from "@/lib/materiales";
import { coordenadasDistrito, empresasCercanas, enlacesMapa, LIMA_CENTRO, RADIOS, type Coordenadas, type LoteUbicable, type Radio } from "@/lib/empresas-cercanas";

export function MapaEmpresasCercanas({ lotes }: { lotes: readonly LoteUbicable[] }) {
  const [ubicacion, setUbicacion] = useState<Coordenadas>(LIMA_CENTRO);
  const [estado, setEstado] = useState("Lima Centro · ubicación de referencia");
  const [detectando, setDetectando] = useState(false);
  const [radio, setRadio] = useState<Radio>("todos");
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const empresas = empresasCercanas(lotes, ubicacion, radio);
  const seleccion = empresas.find((empresa) => empresa.id === seleccionId) ?? empresas[0];
  const enlaces = enlacesMapa(seleccion?.coordenadas ?? ubicacion);
  const sinCoordenadas = lotes.filter((lote) => !coordenadasDistrito(lote.distrito)).length;

  function detectar() {
    setDetectando(true);
    const fallback = () => {
      setUbicacion(LIMA_CENTRO);
      setEstado("No pudimos detectar tu ubicación · Lima Centro activo");
      setSeleccionId(null);
      setDetectando(false);
    };
    if (!navigator.geolocation) { fallback(); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUbicacion({ lat: coords.latitude, lng: coords.longitude });
        setEstado("Tu ubicación actual está activa");
        setSeleccionId(null);
        setDetectando(false);
      }, fallback, { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }

  return (
    <section aria-labelledby="mapa-empresas-titulo" className="mt-12 border-t border-border pt-10">
      <div className="flex items-center gap-3">
        <MapPin className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
        <h2 id="mapa-empresas-titulo" className="font-display text-2xl text-primary-deep sm:text-3xl tracking-normal">Mapa de Empresas Cercanas</h2>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Ubicaciones aproximadas por distrito · distancias en línea recta. La dirección de cada sede aún no está confirmada.</p>

      <div className="my-6 flex flex-wrap items-center gap-4 border-y border-border py-4">
        <Button variant="outline" onClick={detectar} disabled={detectando}>
          <LocateFixed aria-hidden="true" className={detectando ? "animate-pulse" : ""} />
          {detectando ? "Detectando ubicación…" : "Detectar mi ubicación"}
        </Button>
        <p className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground" role="status">
          <span className="h-2 w-2 shrink-0 rounded-full bg-indicator" aria-hidden="true" />{estado}
        </p>
        <div className="flex flex-wrap gap-1 sm:ml-auto" role="group" aria-label="Radio de distancia">
          {RADIOS.map((valor) => (
            <Button key={valor} size="sm" variant={radio === valor ? "default" : "ghost"} aria-pressed={radio === valor}
              onClick={() => { setRadio(valor); setSeleccionId(null); }}>
              {valor === "todos" ? "Todos" : `${valor} km`}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="min-w-0">
          <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
            {empresas.length} {empresas.length === 1 ? "empresa cercana" : "empresas cercanas"}
          </p>
          {empresas.length ? (
            <ul className="max-h-72 space-y-3 overflow-y-auto p-1 md:max-h-[560px]">
              {empresas.map((empresa) => (
                <li key={empresa.id}>
                  <Button variant="outline" aria-pressed={seleccion?.id === empresa.id}
                    onClick={() => setSeleccionId(empresa.id)}
                    className={`h-auto min-h-36 w-full flex-col items-start justify-start gap-3 whitespace-normal rounded-lg p-5 text-left ${seleccion?.id === empresa.id ? "border-primary bg-pale-mint ring-1 ring-primary" : "bg-surface"}`}>
                    <span className="flex w-full min-w-0 items-start justify-between gap-3">
                      <span className="min-w-0 break-words text-base font-semibold">{empresa.nombre}</span>
                      <span className="shrink-0 text-sm text-primary">{empresa.distancia.toFixed(1)} km</span>
                    </span>
                    <span className="flex items-center gap-2 text-sm font-normal text-muted-foreground"><MapPin aria-hidden="true" />{empresa.distrito}</span>
                    <span className="text-xs font-normal text-muted-foreground">RUC pendiente de verificación</span>
                    <span className="text-sm font-normal text-clay">{empresa.categorias.map(nombreCategoria).join(" · ")}</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-52 flex-col items-start justify-center gap-3 border-y border-border py-8">
              <Store className="h-6 w-6 text-clay" aria-hidden="true" />
              <h3 className="text-xl tracking-normal">{lotes.length ? "No hay empresas en este radio" : "Aún no hay empresas con lotes publicados"}</h3>
              <p className="text-sm text-muted-foreground">{lotes.length ? "Amplía el radio para ver otras ubicaciones disponibles." : "Las empresas aparecerán cuando publiquen sus lotes."}</p>
              {radio !== "todos" && <Button variant="outline" onClick={() => setRadio("todos")}>Ver todos los radios</Button>}
            </div>
          )}
          {sinCoordenadas > 0 && <p className="mt-3 text-sm text-muted-foreground">{sinCoordenadas} {sinCoordenadas === 1 ? "lote sin ubicación distrital disponible" : "lotes sin ubicación distrital disponible"}.</p>}
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex min-h-28 flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="break-words font-display text-xl tracking-normal text-primary-deep">{seleccion?.nombre ?? "Ubicación activa"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{seleccion?.distrito ?? (ubicacion === LIMA_CENTRO ? "Lima Centro" : "Tu ubicación actual")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{seleccion ? "Dirección exacta no disponible · referencia distrital" : "Sin empresa seleccionada"}</p>
            </div>
            <Button variant="outline" size="sm" className="h-auto min-h-11 max-w-full whitespace-normal py-2" asChild>
              <a href={enlaces.indicaciones} target="_blank" rel="noopener noreferrer"><Navigation aria-hidden="true" />Cómo llegar en Google Maps</a>
            </Button>
          </div>
          <iframe key={enlaces.mapa} src={enlaces.mapa} title={seleccion ? `Google Maps · referencia de ${seleccion.nombre} en ${seleccion.distrito}` : "Google Maps · ubicación activa"}
            className="h-72 w-full rounded-lg border border-border bg-muted md:h-[460px]" loading="lazy" allowFullScreen referrerPolicy="no-referrer" />
        </div>
      </div>
    </section>
  );
}