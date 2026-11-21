import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { PANEL_ITEMS, type PanelPath } from "./nav";

export function ComingSoon({ path }: { path: PanelPath }) {
  const item = PANEL_ITEMS.find((i) => i.to === path);
  if (!item) return null;
  return (
    <div>
      <h1 className="text-title text-primary-deep">{item.label}</h1>
      <div className="surface-card mt-10 max-w-2xl p-7 md:p-10">
        <Badge variant="outline">
          <Clock strokeWidth={1.5} /> Próximamente
        </Badge>
        <p className="mt-6 font-display text-heading text-primary-deep">Esta sección aún está en construcción.</p>
        <p className="measure mt-3 text-muted-foreground">{item.descripcion}</p>
        <Button variant="outline" className="mt-8" asChild>
          <Link to="/panel">Volver al inicio del panel</Link>
        </Button>
      </div>
    </div>
  );
}
