import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { fechaLima } from "@/lib/lotes";
import { listarProblemas } from "@/lib/tratos.functions";

/** Cola del equipo admin: entregas que la empresa compradora marcó con problema. */
export function ProblemasEntrega() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ["problemas-entrega"], queryFn: () => listarProblemas() });

  if (isLoading) return <p className="mt-6 text-muted-foreground">Cargando entregas con problema…</p>;
  if (error) return <p role="alert" className="mt-6 text-destructive">No pudimos cargar las entregas con problema.</p>;
  if (!data.length) {
    return (
      <div className="surface-card mt-6 p-8">
        <h3 className="font-display text-xl text-primary-deep">No hay entregas con problema</h3>
        <p className="measure mt-2 text-muted-foreground">Cuando una empresa compradora avise que algo salió mal en una entrega, aparecerá aquí.</p>
      </div>
    );
  }
  return (
    <ul className="mt-6 space-y-3">
      {data.map((p) => (
        <li key={p.id} className="surface-card flex gap-3 p-5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-medium">
              {p.lotes ? <Link to="/lote/$codigo" params={{ codigo: p.lotes.codigo }} className="underline-offset-4 hover:underline">{p.lotes.codigo}</Link> : "Lote"}
              <span className="text-muted-foreground"> · {fechaLima(p.problema_at)} (hora de Lima)</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{p.problema_detalle || "La empresa compradora no dejó detalle."}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
