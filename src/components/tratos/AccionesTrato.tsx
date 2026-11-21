import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { FileDown, MessageCircle, PackageCheck } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { descargarConstanciaPdf } from "@/lib/constancia-pdf";
import type { Trato } from "@/lib/tratos";
import { accionTrato } from "@/lib/tratos.functions";
import { accionesDisponibles, enlaceWhatsApp, type AccionTrato } from "@/lib/tratos-reglas";

const LABEL = { aceptar: "Aceptar", rechazar: "Rechazar", cancelar: "Cancelar trato", entregar: "Entregué el material" } as const;

export function ConfirmarRecepcion({ trato, destacado }: { trato: Trato; destacado?: boolean }) {
  const accion = useServerFn(accionTrato);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [recibido, setRecibido] = useState(false);
  const [problema, setProblema] = useState(false);
  const [detalle, setDetalle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState("");

  async function enviar(tipo: "confirmar" | "problema") {
    setBusy(true); setError("");
    try {
      const r = await accion({ data: { id: trato.id, accion: tipo, detalle, recibido: tipo === "confirmar" ? recibido : undefined } });
      setHecho(tipo === "confirmar" ? `Listo. Emitimos la constancia ${r.numero ?? ""}.` : "Avisamos al equipo de Remanente. Ambas empresas verán el aviso.");
      void qc.invalidateQueries({ queryKey: ["mis-tratos"] });
      void qc.invalidateQueries({ queryKey: ["pasaporte"] });
    } catch (e) { setError(e instanceof Error ? e.message : "No pudimos guardar tu respuesta."); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={destacado ? "lg" : "sm"}><PackageCheck strokeWidth={1.5} /> Confirmar recepción</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirmar recepción de {trato.lote?.codigo}</DialogTitle>
          <DialogDescription>La fecha y hora las registra Remanente al confirmar.</DialogDescription>
        </DialogHeader>
        {hecho ? <p role="status" className="rounded-md border border-border bg-mint p-4">{hecho}</p> : problema ? (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void enviar("problema"); }}>
            <label htmlFor="detalle-problema" className="text-sm font-medium">¿Qué pasó con la entrega? (opcional)</label>
            <Textarea id="detalle-problema" maxLength={500} value={detalle} onChange={(e) => setDetalle(e.target.value)} />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="destructive" disabled={busy}>Avisar del problema</Button>
              <Button type="button" variant="ghost" onClick={() => setProblema(false)}>Volver</Button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void enviar("confirmar"); }}>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={recibido} onChange={(e) => setRecibido(e.target.checked)} />
              Recibí el material y coincide con lo publicado
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy || !recibido}>Confirmar y emitir constancia</Button>
              <Button type="button" variant="outline" onClick={() => setProblema(true)}>Hay un problema con la entrega</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AccionesTrato({ trato }: { trato: Trato }) {
  const accion = useServerFn(accionTrato);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const acciones = accionesDisponibles(trato.estado, trato.rol);
  const wa = trato.otra.contacto ? enlaceWhatsApp(trato.otra.telefono) : null;
  const qrId = `qr-constancia-${trato.id}`;

  async function ejecutar(a: keyof typeof LABEL) {
    if ((a === "rechazar" || a === "cancelar") && !window.confirm(a === "rechazar" ? "¿Rechazar esta solicitud?" : "¿Cancelar este trato?")) return;
    setBusy(true); setError("");
    try { await accion({ data: { id: trato.id, accion: a } }); void qc.invalidateQueries({ queryKey: ["mis-tratos"] }); }
    catch (e) { setError(e instanceof Error ? e.message : "No pudimos actualizar el trato."); }
    finally { setBusy(false); }
  }

  function pdf() {
    const canvas = document.getElementById(qrId) as HTMLCanvasElement | null;
    if (canvas) void descargarConstanciaPdf(trato, canvas.toDataURL("image/png"));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {acciones.filter((a): a is keyof typeof LABEL => a in LABEL).map((a) => (
        <Button key={a} size="sm" variant={a === "aceptar" || a === "entregar" ? "default" : "outline"} disabled={busy} onClick={() => void ejecutar(a)}>{LABEL[a]}</Button>
      ))}
      {acciones.includes("confirmar" as AccionTrato) && <ConfirmarRecepcion trato={trato} />}
      {wa && (
        <Button size="sm" variant="outline" asChild>
          <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle strokeWidth={1.5} /> Abrir WhatsApp</a>
        </Button>
      )}
      {trato.constancia && (
        <>
          <span className="sr-only" aria-hidden="true"><QRCodeCanvas id={qrId} value={`${typeof window === "undefined" ? "" : window.location.origin}/constancia/${trato.constancia.numero}`} size={256} marginSize={2} /></span>
          <Button size="sm" onClick={pdf}><FileDown strokeWidth={1.5} /> Descargar constancia</Button>
          <Button size="sm" variant="ghost" asChild><Link to="/constancia/$numero" params={{ numero: trato.constancia.numero }}>Ver verificación</Link></Button>
        </>
      )}
      {error && <p role="alert" className="w-full text-sm text-destructive">{error}</p>}
    </div>
  );
}
