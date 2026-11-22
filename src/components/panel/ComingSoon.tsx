import { Link } from "@tanstack/react-router";
import { Clock, Scale, Cloud, Droplets, ArrowLeft, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { PANEL_ITEMS, type PanelPath } from "./nav";

export function ComingSoon({ path }: { path: PanelPath }) {
  const item = PANEL_ITEMS.find((i) => i.to === path);
  if (!item) return null;

  if (path === "/panel/impacto") {
    const metricas = [
      {
        titulo: "Alimentos desviados",
        valor: "1,240 kg",
        descripcion: "Rescatados de convertirse en merma este mes",
        icono: Scale,
        tendencia: "+12% vs mes anterior",
      },
      {
        titulo: "Huella de carbono evitada",
        valor: "3,100 kg CO₂e",
        descripcion: "Emisiones de gases de efecto invernadero prevenidas",
        icono: Cloud,
        tendencia: "+8% vs mes anterior",
      },
      {
        titulo: "Agua ahorrada",
        valor: "45,800 L",
        descripcion: "Recurso hídrico conservado en la cadena de producción",
        icono: Droplets,
        tendencia: "+15% vs mes anterior",
      },
    ];

    return (
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-title text-primary-deep">{item.label}</h1>
          <p className="measure text-muted-foreground">{item.descripcion}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {metricas.map((m, index) => {
            const IconComponent = m.icono;
            return (
              <div
                key={index}
                className="surface-card flex flex-col justify-between p-6"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary-deep">
                      <IconComponent strokeWidth={1.75} className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs font-normal">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {m.tendencia}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{m.titulo}</p>
                  <p className="mt-1 font-display text-3xl font-bold text-primary-deep">
                    {m.valor}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {m.descripcion}
                  </p>
                </div>
              </div>
            );
          })}
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

  return (
    <div>
      <h1 className="text-title text-primary-deep">{item.label}</h1>
      <div className="surface-card mt-10 max-w-2xl p-7 md:p-10">
        <Badge variant="outline">
          <Clock strokeWidth={1.5} /> Próximamente
        </Badge>
        <p className="mt-6 font-display text-heading text-primary-deep">
          Esta sección aún está en construcción.
        </p>
        <p className="measure mt-3 text-muted-foreground">{item.descripcion}</p>
        <Button variant="outline" className="mt-8" asChild>
          <Link to="/panel">Volver al inicio del panel</Link>
        </Button>
      </div>
    </div>
  );
}
