import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Navigation,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PuntoSimbiosis {
  id: number;
  nombre: string;
  distrito: string;
  tipo: string;
  lat: number;
  lng: number;
}

const PUNTOS_SIMBIOSIS: PuntoSimbiosis[] = [
  {
    id: 1,
    nombre: "Zona Industrial Callao",
    distrito: "Callao",
    tipo: "Planta de valorización orgánica",
    lat: -12.0464,
    lng: -77.1181,
  },
  {
    id: 2,
    nombre: "Parque Industrial Ate",
    distrito: "Ate, Lima",
    tipo: "Centro de acopio y compostaje",
    lat: -12.0268,
    lng: -76.9242,
  },
  {
    id: 3,
    nombre: "Zona Industrial Villa El Salvador",
    distrito: "Villa El Salvador, Lima",
    tipo: "Procesamiento de subproductos",
    lat: -12.2133,
    lng: -76.9422,
  },
  {
    id: 4,
    nombre: "Corredor Industrial Lima Norte",
    distrito: "Carabayllo / Puente Piedra",
    tipo: "Nodo de recuperación agrícola",
    lat: -11.8692,
    lng: -77.0325,
  },
];

// Convierte latitud/longitud a coordenadas de tesela (tile) estándar de mapas web
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

export function MapaSimbiosis() {
  const [puntoActivo, setPuntoActivo] = useState<PuntoSimbiosis>(
    () => PUNTOS_SIMBIOSIS.at(0)!
  );
  const [zoom, setZoom] = useState<number>(13);

  const centerTile = latLngToTile(puntoActivo.lat, puntoActivo.lng, zoom);
  const offsets = [-1, 0, 1];

  const googleMapsUrl = `https://google.com{puntoActivo.lat},${puntoActivo.lng}`;
  const googleDirectionsUrl = `https://google.com{puntoActivo.lat},${puntoActivo.lng}`;

  return (
    <div>
      <div className="flex flex-col gap-2">
        <h1 className="text-title text-primary-deep">Mapa</h1>
        <p className="measure text-muted-foreground">
          Mapa de simbiosis industrial en Lima y Callao.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lista de nodos interactivos */}
        <div className="flex flex-col gap-3">
          {PUNTOS_SIMBIOSIS.map((punto) => {
            const seleccionado = punto.id === puntoActivo.id;
            return (
              <button
                key={punto.id}
                type="button"
                onClick={() => setPuntoActivo(punto)}
                className={`surface-card p-4 text-left transition-all ${
                  seleccionado
                    ? "border-primary ring-1 ring-primary"
                    : "hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-primary-deep">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span>{punto.nombre}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {punto.distrito} • {punto.tipo}
                </p>
              </button>
            );
          })}

          <div className="mt-2 flex flex-col gap-2">
            <Button variant="default" size="sm" className="w-full" asChild>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                Ver en Google Maps
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>

            <Button variant="outline" size="sm" className="w-full" asChild>
              <a
                href={googleDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cómo llegar (GPS)
                <Navigation className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Visor de mapa por teselas (sin iframes bloqueados) */}
        <div className="surface-card relative h-96 overflow-hidden bg-[#e5ebe7] p-0 select-none lg:col-span-2">
          {/* Cuadrícula 3x3 de calles reales */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {offsets.map((dy) =>
              offsets.map((dx) => {
                const tileX = centerTile.x + dx;
                const tileY = centerTile.y + dy;
                return (
                  <img
                    key={`${zoom}-${tileX}-${tileY}`}
                    src={`https://cartocdn.com{zoom}/${tileX}/${tileY}.png`}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                );
              })
            )}
          </div>

          {/* Pin central del nodo activo */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="mb-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary-deep shadow-md ring-1 ring-black/10">
              {puntoActivo.nombre}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-white">
              <MapPin className="h-5 w-5" />
            </div>
          </div>

          {/* Controles de zoom */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 1, 16))}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-primary-deep shadow hover:bg-gray-50"
              title="Acercar"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 1, 11))}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-primary-deep shadow hover:bg-gray-50"
              title="Alejar"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </div>

          {/* Pie con coordenadas */}
          <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
            {puntoActivo.distrito} ({puntoActivo.lat.toFixed(4)},{" "}
            {puntoActivo.lng.toFixed(4)})
          </div>
        </div>
      </div>

      <Button variant="outline" className="mt-8" asChild>
        <Link to="/panel">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio del panel
        </Link>
      </Button>
    </div>
  );
}
