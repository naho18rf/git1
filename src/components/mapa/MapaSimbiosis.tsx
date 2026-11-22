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
  left: string;
  top: string;
}

const PUNTOS_SIMBIOSIS: PuntoSimbiosis[] = [
  {
    id: 1,
    nombre: "Zona Industrial Callao",
    distrito: "Callao",
    tipo: "Planta de valorización orgánica",
    lat: -12.0464,
    lng: -77.1181,
    left: "34%",
    top: "48%",
  },
  {
    id: 2,
    nombre: "Parque Industrial Ate",
    distrito: "Ate, Lima",
    tipo: "Centro de acopio y compostaje",
    lat: -12.0268,
    lng: -76.9242,
    left: "68%",
    top: "44%",
  },
  {
    id: 3,
    nombre: "Zona Industrial Villa El Salvador",
    distrito: "Villa El Salvador, Lima",
    tipo: "Procesamiento de subproductos",
    lat: -12.2133,
    lng: -76.9422,
    left: "64%",
    top: "78%",
  },
  {
    id: 4,
    nombre: "Corredor Industrial Lima Norte",
    distrito: "Carabayllo / Puente Piedra",
    tipo: "Nodo de recuperación agrícola",
    lat: -11.8692,
    lng: -77.0325,
    left: "45%",
    top: "22%",
  },
];

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

        {/* Visor de mapa */}
        <div className="surface-card relative h-96 overflow-hidden bg-[#dfe8e2] p-0 select-none lg:col-span-2">
          {/* Mapa vectorial base de Lima y Callao */}
          <svg
            viewBox="0 0 600 400"
            className="absolute inset-0 h-full w-full opacity-60"
            preserveAspectRatio="xMidYMid slice"
          >
            <rect width="600" height="400" fill="#e8efe9" />
            <path d="M0,0 L160,0 L195,180 L250,400 L0,400 Z" fill="#cbe0eb" />
            <g stroke="#ffffff" strokeWidth="5" fill="none">
              <path d="M180,0 L290,400" />
              <path d="M150,160 L600,130" />
              <path d="M165,210 L580,260" />
              <path d="M140,90 L480,40" />
            </g>
            <g stroke="#d3dfd7" strokeWidth="1.5" fill="none">
              <path d="M220,0 L340,400" />
              <path d="M280,0 L410,400" />
              <path d="M350,0 L490,400" />
              <path d="M160,110 L600,85" />
              <path d="M185,280 L600,320" />
            </g>
          </svg>

          {/* Cuadrícula 3x3 de calles reales */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {offsets.map((dy) =>
              offsets.map((dx) => {
                const tileX = centerTile.x + dx;
                const tileY = centerTile.y + dy;
                return (
                  <img
                    key={`${zoom}-${tileX}-${tileY}`}
                    src={`https://openstreetmap.org{zoom}/${tileX}/${tileY}.png`}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                );
              })
            )}
          </div>

          {/* Pin dinámico del nodo activo */}
          <div
            style={{ left: puntoActivo.left, top: puntoActivo.top }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300"
          >
            <div className="mb-1 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary-deep shadow-md ring-1 ring-black/10">
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
