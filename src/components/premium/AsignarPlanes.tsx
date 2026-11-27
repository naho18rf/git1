import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { PlanId } from "@/lib/premium-reglas";
import { planesAdminQuery } from "@/lib/premium";
import { asignarPlan } from "@/lib/premium.functions";
import { PLANES } from "@/lib/planes";

export function AsignarPlanes() {
  const cliente = useQueryClient();
  const { data = [], isLoading, isError } = useQuery(planesAdminQuery);
  const cambiar = useMutation({
    mutationFn: (v: { empresaId: string; plan: PlanId }) => asignarPlan({ data: v }),
    onSuccess: () => {
      toast.success("Plan guardado");
      void cliente.invalidateQueries({ queryKey: ["planes-admin"] });
    },
    onError: (e) => toast.error(e.message),
  });
  if (isLoading) return <p className="mt-4 text-muted-foreground">Cargando…</p>;
  if (isError)
    return (
      <p role="alert" className="mt-4 text-destructive">
        No pudimos cargar los planes.
      </p>
    );
  return (
    <ul className="mt-4 space-y-3">
      {data.map((e) => (
        <li
          key={e.id}
          className="surface-card flex flex-wrap items-center justify-between gap-3 p-4"
        >
          <span>{e.nombre}</span>
          <select
            aria-label={`Plan de ${e.nombre}`}
            className="h-11 rounded-md border border-input bg-surface px-3 text-sm"
            value={e.plan}
            disabled={cambiar.isPending}
            onChange={(ev) => cambiar.mutate({ empresaId: e.id, plan: ev.target.value as PlanId })}
          >
            {PLANES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}
