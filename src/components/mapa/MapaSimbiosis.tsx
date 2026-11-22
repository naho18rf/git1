import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const PUNTOS_SIMBIOSIS = [
  {
    id: 1,
    nombre: "Zona Industrial Callao",
    distrito: "Callao",
    tipo: "Planta de valorización orgánica",
    query: "Zona+Industrial+Callao+Lima+Peru",
  },
  {
    id: 2,
    nombre: "Parque Industrial Ate",
    distrito: "Ate, Lima",
    tipo: "Centro de acopio y compostaje",
    query: "Parque+Industrial+Ate+Lima+Peru",
  },
  {
    id: 3,
    nombre: "Zona Industrial Villa El Salvador",
    distrito: "Villa El Salvador, Lima",
    tipo: "Procesamiento de subproductos",
    query: "Parque+Industrial+Villa+El+Salvador+Lima+Peru",
  },
  {
    id: 4,
    nombre: "Corredor Industrial Lima Norte",
    distrito: "Carabayllo / Puente Piedra",
    tipo: "Nodo de recuperación agrícola",
    query: "Carabayllo+Lima+Peru",
  },
];

export function MapaSimbiosis() {
  const [puntoActivo, setPuntoActivo] = useState(PUNTOS_SIMBIOSIS[0]);

  const mapUrl = `https://google.com{puntoActivo.query}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const externalUrl = `https://google.com{puntoActivo.query}`;

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

          <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
            <a href={externalUrl} target="_blank" rel="noopener noreferrer">
              Abrir ubicación en Google Maps
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>

        <div className="surface-card overflow-hidden p-0 lg:col-span-2">
          <iframe
            title={`Mapa - ${puntoActivo.nombre}`}
            src={mapUrl}
            className="h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
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
