import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listarEmpresasSugeridas } from "@/lib/lotes.functions";

export function EmpresasSugeridas({ loteId, distrito }: { loteId: string; distrito: string }) {
  const listar = useServerFn(listarEmpresasSugeridas);
  const { data, isLoading, error } = useQuery({
    queryKey: ["empresas-sugeridas", loteId],
    queryFn: () => listar({ data: { loteId, distrito } }),
  });
  return (
    <section className="mt-8 border-t border-border pt-6">
      <h2 className="text-heading">Empresas que podrían usar este material</h2>
      {isLoading ? <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
        : error ? <p role="alert" className="mt-4 text-sm text-destructive">No pudimos cargar las empresas sugeridas.</p>
        : !data?.length ? <p className="mt-4 text-sm text-muted-foreground">Aún no hay empresas que coincidan</p>
        : <ul className="mt-4 divide-y divide-border">{data.map((e, i) => <li key={`${e.nombre_empresa}-${i}`} className="py-3"><p className="font-medium">{e.nombre_empresa}</p><p className="text-sm text-muted-foreground">{e.distrito}</p></li>)}</ul>}
    </section>
  );
}
