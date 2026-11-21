import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { HandHeart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { solicitarLote } from "@/lib/tratos.functions";
import { MAX_MENSAJE_SOLICITUD, OPCIONES_RECOGIDA } from "@/lib/tratos-reglas";

export function SolicitarLote({ loteId, codigo, autoAbrir = false }: { loteId: string; codigo: string; autoAbrir?: boolean }) {
  const solicitar = useServerFn(solicitarLote);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [recogida, setRecogida] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  // Llega desde el mercado con ?solicitar=1: abrir el diálogo directamente.
  useEffect(() => {
    if (autoAbrir) setOpen(true);
  }, [autoAbrir]);

  async function enviar() {
    if (!recogida) return setError("Cuéntanos cómo recogerán el lote.");
    setBusy(true); setError("");
    try {
      await solicitar({ data: { loteId, mensaje: mensaje.trim(), recogida: recogida as (typeof OPCIONES_RECOGIDA)[number] } });
      setEnviado(true);
      void qc.invalidateQueries({ queryKey: ["mis-tratos"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos enviar la solicitud.");
    } finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEnviado(false); }}>
      <DialogTrigger asChild>
        <Button><HandHeart strokeWidth={1.5} /> Solicitar este lote</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Solicitar {codigo}</DialogTitle>
          <DialogDescription>La empresa decidirá si acepta. Al aceptar, ambas verán sus datos de contacto para coordinar.</DialogDescription>
        </DialogHeader>
        {enviado ? (
          <p role="status" className="rounded-md border border-border bg-mint p-4">Listo, enviamos tu solicitud. Puedes seguirla en "Mis tratos".</p>
        ) : (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void enviar(); }}>
            <fieldset>
              <legend className="text-sm font-medium">¿Cómo recogerán el lote?</legend>
              <div className="mt-2 space-y-2">
                {OPCIONES_RECOGIDA.map((op) => (
                  <label key={op} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border px-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-mint">
                    <input type="radio" name="recogida" value={op} checked={recogida === op} onChange={() => setRecogida(op)} />
                    {op}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="mensaje-solicitud" className="text-sm font-medium">Mensaje (opcional)</label>
              <Textarea id="mensaje-solicitud" className="mt-2" maxLength={MAX_MENSAJE_SOLICITUD} value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Ej.: Nos interesa para relleno de cojines." />
              <p className="mt-1 text-right text-xs text-muted-foreground">{mensaje.length}/{MAX_MENSAJE_SOLICITUD}</p>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full">{busy ? "Enviando…" : "Enviar solicitud"}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
