import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { revisionQuery, fechaLima } from "@/lib/lotes";
import { nombreCategoria } from "@/lib/materiales";
import { revisarLote } from "@/lib/lotes.functions";

/** Cola de lotes en revisión. Solo el rol admin puede verla y aprobar o rechazar. */
export function ColaRevision() {
  const { data: lotes = [], isLoading, error } = useQuery(revisionQuery);
  const client = useQueryClient();
  const review = useServerFn(revisarLote);
  const [motivos, setMotivos] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [aviso, setAviso] = useState("");

  async function decidir(id: string, aprobar: boolean) {
    const motivo = (motivos[id] ?? "").trim();
    if (!aprobar && !motivo) {
      setAviso("Escribe un motivo para rechazar el lote.");
      return;
    }
    setBusy(id);
    setAviso("");
    try {
      await review({ data: { id, aprobar, motivo } });
      setMotivos((m) => ({ ...m, [id]: "" }));
      await client.invalidateQueries({ queryKey: ["revision-lotes"] });
      await client.invalidateQueries({ queryKey: ["mercado"] });
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "No pudimos actualizar el lote.");
    } finally {
      setBusy("");
    }
  }

  if (isLoading) return <p className="mt-8 text-muted-foreground">Cargando la cola de revisión…</p>;
  if (error) return <p role="alert" className="mt-8 text-destructive">No pudimos cargar la cola de revisión.</p>;
  if (!lotes.length)
    return (
      <div className="surface-card mt-8 p-8">
        <h2 className="font-display text-2xl text-primary-deep">No hay lotes por revisar</h2>
        <p className="measure mt-2 text-muted-foreground">
          Cuando una empresa envíe un lote que necesite revisión, aparecerá aquí con sus fotos y su código de verificación.
        </p>
      </div>
    );

  return (
    <div className="mt-8 space-y-8">
      {aviso && <p role="alert" className="text-sm text-destructive">{aviso}</p>}
      {lotes.map((lote) => {
        const sinEnVivo = lote.lote_fotos.some((f) => !f.captura_en_vivo);
        return (
          <article key={lote.id} className="surface-card p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-2xl text-primary-deep">{lote.codigo}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lote.empresas?.nombre_empresa ?? "Empresa"} · {nombreCategoria(lote.categoria)} · {lote.peso_kg} kg ·{" "}
                  {lote.distrito}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enviado el {fechaLima(lote.created_at)} (Lima)
                </p>
              </div>
              <p className="rounded-md border border-border bg-mint px-4 py-2 text-center">
                <span className="block text-[13px] tracking-[0.16em] text-clay uppercase">Código</span>
                <strong className="font-display text-2xl tabular-nums">{lote.codigo_verificacion}</strong>
                <span className="block text-xs text-muted-foreground">
                  Válido hasta {fechaLima(lote.codigo_verificacion_expira_at)} (Lima)
                </span>
              </p>
            </div>

            <p className="mt-5 whitespace-pre-wrap text-[15px]">{lote.descripcion}</p>
            <p className="mt-2 text-sm text-muted-foreground">Empaque: {lote.empaque}</p>
            {sinEnVivo && (
              <p className="mt-3 text-sm text-clay">
                Alguna foto se tomó con la captura alternativa, fuera de esta página.
              </p>
            )}

            <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {lote.fotos.map((foto, i) => (
                <li key={foto.id}>
                  <img
                    src={foto.url}
                    alt={`Foto ${i + 1} del lote ${lote.codigo}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-md object-cover"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {foto.captura_en_vivo ? "Capturada en la página" : "Captura alternativa"}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-border pt-5">
              <label htmlFor={`motivo-${lote.id}`} className="text-sm font-medium">
                Motivo del rechazo
              </label>
              <Textarea
                id={`motivo-${lote.id}`}
                maxLength={500}
                value={motivos[lote.id] ?? ""}
                onChange={(e) => setMotivos((m) => ({ ...m, [lote.id]: e.target.value }))}
                className="mt-2"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <Button disabled={busy === lote.id} onClick={() => void decidir(lote.id, true)}>
                  <Check strokeWidth={1.5} /> Aprobar
                </Button>
                <Button variant="outline" disabled={busy === lote.id} onClick={() => void decidir(lote.id, false)}>
                  <X strokeWidth={1.5} /> Rechazar
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
