import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Flag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { reportarLote } from "@/lib/lotes.functions";
import { MOTIVOS_REPORTE } from "@/lib/lotes-reglas";

/** Reporte de un lote publicado. El servidor evita reportar tu propio lote o repetir el mismo reporte. */
export function ReportarLote({ loteId }: { loteId: string }) {
  const report = useServerFn(reportarLote);
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState<string>(MOTIVOS_REPORTE[0]);
  const [detalle, setDetalle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar() {
    setBusy(true);
    setError("");
    try {
      await report({ data: { loteId, motivo, detalle: detalle.trim() || undefined } });
      setEnviado(true);
      setDetalle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos enviar el reporte.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEnviado(false); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Flag strokeWidth={1.5} /> Reportar lote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reportar este lote</DialogTitle>
          <DialogDescription>
            Tu reporte llega al equipo de Remanente y ayuda a reducir el riesgo. No es una denuncia legal.
          </DialogDescription>
        </DialogHeader>

        {enviado ? (
          <p role="status" className="rounded-md border border-border bg-mint p-4">
            Gracias. Ya revisaremos este lote.
          </p>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              void enviar();
            }}
          >
            <div>
              <label htmlFor="motivo-reporte" className="text-sm font-medium">
                Motivo
              </label>
              <select
                id="motivo-reporte"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-surface px-3 text-sm"
              >
                {MOTIVOS_REPORTE.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="detalle-reporte" className="text-sm font-medium">
                Detalle (opcional)
              </label>
              <Textarea
                id="detalle-reporte"
                maxLength={500}
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                placeholder="Cuéntanos qué viste, si quieres."
                className="mt-2"
              />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Enviando…" : "Enviar reporte"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
