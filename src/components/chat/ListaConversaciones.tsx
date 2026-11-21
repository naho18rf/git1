import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  conversacionesQuery,
  crearConversacion,
  eliminarConversacion,
  fechaCorta,
} from "@/lib/chat/asistente";
import { cn } from "@/lib/utils";

export function useNuevaConversacion() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearConversacion,
    onSuccess: (id) => {
      void queryClient.invalidateQueries({ queryKey: ["chat", "conversaciones"] });
      navigate({ to: "/panel/asistente/$conversacionId", params: { conversacionId: id } });
    },
    onError: () => toast.error("No pudimos crear la conversación. Inténtalo de nuevo."),
  });
}

export function BotonNuevaConversacion({ className }: { className?: string }) {
  const nueva = useNuevaConversacion();
  return (
    <Button className={className} onClick={() => nueva.mutate()} disabled={nueva.isPending}>
      {nueva.isPending ? <Loader2 className="animate-spin" /> : <Plus strokeWidth={1.5} />}
      Nueva conversación
    </Button>
  );
}

/** Lista de conversaciones: vertical en escritorio, chips horizontales en móvil. */
export function ListaConversaciones({ activeId }: { activeId?: string }) {
  const { data: conversaciones, isLoading } = useQuery(conversacionesQuery);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const eliminar = useMutation({
    mutationFn: eliminarConversacion,
    onSuccess: (_v, id) => {
      void queryClient.invalidateQueries({ queryKey: ["chat", "conversaciones"] });
      if (id === activeId) navigate({ to: "/panel/asistente" });
    },
    onError: () => toast.error("No pudimos eliminar la conversación."),
  });

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
      </p>
    );
  }
  if (!conversaciones?.length) {
    return <p className="text-sm text-muted-foreground">Aún no tienes conversaciones.</p>;
  }

  return (
    <>
      {/* Escritorio: lista vertical */}
      <ul className="hidden flex-col gap-1 lg:flex" aria-label="Tus conversaciones">
        {conversaciones.map((c) => (
          <li key={c.id} className="group flex items-center gap-1">
            <Link
              to="/panel/asistente/$conversacionId"
              params={{ conversacionId: c.id }}
              aria-current={c.id === activeId ? "page" : undefined}
              className={cn(
                "min-w-0 flex-1 rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface",
                c.id === activeId
                  ? "bg-mint font-medium text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <span className="block truncate">{c.titulo}</span>
              <span className="block text-xs text-muted-foreground">
                {fechaCorta(c.updated_at)}
              </span>
            </Link>
            <button
              type="button"
              aria-label={`Eliminar conversación ${c.titulo}`}
              className="grid h-11 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:text-destructive"
              onClick={() => eliminar.mutate(c.id)}
              disabled={eliminar.isPending}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </li>
        ))}
      </ul>

      {/* Móvil: chips horizontales */}
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Tus conversaciones">
        {conversaciones.map((c) => (
          <li key={c.id} className="shrink-0">
            <Link
              to="/panel/asistente/$conversacionId"
              params={{ conversacionId: c.id }}
              aria-current={c.id === activeId ? "page" : undefined}
              className={cn(
                "flex min-h-11 max-w-48 items-center rounded-full border px-4 text-[13px] transition-colors",
                c.id === activeId
                  ? "border-primary/30 bg-mint font-medium text-primary"
                  : "border-border bg-surface text-muted-foreground hover:text-primary",
              )}
            >
              <span className="truncate">{c.titulo}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
