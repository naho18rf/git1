import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, ExternalLink, Navigation } from "lucide-react";
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

export function MapaSimbiosis() {
  const [puntoActivo, setPuntoActivo] = useState<PuntoSimbiosis>(
    () => PUNTOS_SIMBIOSIS.at(0)!
  );

  const delta = 0.025;
  const bbox = `${puntoActivo.lng - delta},${puntoActivo.lat - delta},${
    puntoActivo.lng + delta
  },${puntoActivo.lat + delta}`;

  const mapUrl = `https://openstreetmap.org{bbox}&layer=mapnik&marker=${puntoActivo.lat},${puntoActivo.lng}`;
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

        <div className="surface-card relative h-96 overflow-hidden bg-[#eef3ef] p-0 lg:col-span-2">
          <iframe
            key={puntoActivo.id}
            title={`Mapa - ${puntoActivo.nombre}`}
            src={mapUrl}
            className="h-full w-full border-0"
          />
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
