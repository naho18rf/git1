import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, BadgeCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmarRecepcion } from "@/components/tratos/AccionesTrato";
import { fechaLima } from "@/lib/lotes";
import { misTratosQuery } from "@/lib/tratos";
import { puedeAccion } from "@/lib/tratos-reglas";

const ESTADOS_ENTREGA = ["entregada", "con_problema", "completada"] as const;

/** Estado de la entrega en la página del lote (la que abre el QR), solo para las dos empresas del trato. */
export function TratoEnLote({ codigo, userId }: { codigo: string; userId: string }) {
  const { data = [] } = useQuery(misTratosQuery(userId));
  const trato = data.find((t) => t.lote?.codigo === codigo && (ESTADOS_ENTREGA as readonly string[]).includes(t.estado));
  if (!trato) return null;

  if (puedeAccion(trato.estado, "confirmar", trato.rol)) {
    return (
      <section className="surface-card mt-8 border-primary/30 p-6" aria-labelledby="confirmar-recepcion">
        <Truck className="h-6 w-6 text-primary" strokeWidth={1.5} aria-hidden="true" />
        <h2 id="confirmar-recepcion" className="mt-3 font-display text-2xl text-primary-deep">¿Ya recibiste este lote?</h2>
        <p className="measure mt-2 text-muted-foreground">
          {trato.otra.nombre_empresa ?? "La empresa vendedora"} marcó la entrega{trato.entregada_at ? ` el ${fechaLima(trato.entregada_at)} (hora de Lima)` : ""}. Revisa el material y confirma para cerrar el trato y emitir la constancia.
        </p>
        <div className="mt-5"><ConfirmarRecepcion trato={trato} destacado /></div>
      </section>
    );
  }

  if (trato.estado === "entregada") {
    return (
      <p role="status" className="surface-card mt-8 p-5 text-sm text-muted-foreground">
        Marcaste este lote como entregado. Falta que {trato.otra.nombre_empresa ?? "la empresa compradora"} confirme la recepción.
      </p>
    );
  }

  if (trato.estado === "con_problema") {
    return (
      <p role="status" className="mt-8 flex gap-2 rounded-md border border-destructive/40 p-4 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
        Se reportó un problema con la entrega de este lote. El equipo de Remanente lo revisará; puedes seguirlo en Mis tratos.
      </p>
    );
  }

  return trato.constancia ? (
    <div className="surface-card mt-8 flex flex-wrap items-center gap-4 p-5">
      <BadgeCheck className="h-6 w-6 text-primary" strokeWidth={1.5} aria-hidden="true" />
      <p className="flex-1 text-sm">Entrega confirmada. Constancia <strong>{trato.constancia.numero}</strong> · {fechaLima(trato.constancia.emitida_at)} (hora de Lima)</p>
      <Button asChild size="sm" variant="outline"><Link to="/panel/tratos">Descargar en Mis tratos</Link></Button>
    </div>
  ) : null;
}
