import { useEffect, useRef, useState } from "react";
import { Camera, Trash2, RefreshCw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { generarCodigo } from "@/lib/lotes.functions";
import { MAX_BYTES_FOTO, MAX_FOTOS, TIPOS_FOTO } from "@/lib/lotes-reglas";
import { fechaLima } from "@/lib/lotes";

export type FotoPendiente = { ruta: string; enVivo: boolean; preview: string };
export type CodigoFoto = { id: string; codigo: string; expira_at: string };

async function comprimir(source: CanvasImageSource, width: number, height: number): Promise<Blob> {
  const scale = Math.min(1, 1600 / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d"); if (!context) throw new Error("No pudimos preparar la foto.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.8, 0.65, 0.5, 0.35]) {
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= MAX_BYTES_FOTO) return blob;
  }
  throw new Error("La foto es demasiado grande. Prueba de nuevo.");
}

export function CamaraLote({ userId, fotos, onFotos, codigo, onCodigo }: { userId: string; fotos: FotoPendiente[]; onFotos: (f: FotoPendiente[]) => void; codigo: CodigoFoto | null; onCodigo: (c: CodigoFoto) => void }) {
  const generate = useServerFn(generarCodigo);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);
  const initializing = useRef(false);

  useEffect(() => {
    let active = true;
    if (!codigo && !initializing.current) {
      initializing.current = true;
      // onCodigo se llama siempre: si el componente se desmonta y vuelve a montar
      // (cambio de sesión, re-render de la ruta) el código ya generado no se descarta.
      generate()
        .then((c) => { onCodigo(c); })
        .catch(() => { if (active) setError("No pudimos generar el código. Inténtalo de nuevo."); })
        .finally(() => { initializing.current = false; });
    }
    setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; clearInterval(timer); stream.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  async function renovar() {
    setBusy(true); setError("");
    try {
      const c = await generate();
      for (const f of fotos) { await supabase.storage.from("lote-fotos").remove([f.ruta]); URL.revokeObjectURL(f.preview); }
      onFotos([]); onCodigo(c);
    } catch { setError("No pudimos renovar el código. Inténtalo de nuevo."); }
    finally { setBusy(false); }
  }

  async function abrirCamara() {
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Cámara no disponible");
      stream.current?.getTracks().forEach(t => t.stop());
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1600 } }, audio: false });
      stream.current = media;
      if (video.current) { video.current.srcObject = media; await video.current.play(); }
      setCameraReady(true); setFallback(false);
    } catch { setFallback(true); setCameraReady(false); setError("No pudimos abrir la cámara. Revisa el permiso o usa la captura alternativa; tu lote pasará a revisión."); }
  }

  const expired = !!codigo && now >= new Date(codigo.expira_at).getTime();
  async function guardar(blob: Blob, enVivo: boolean) {
    if (!codigo || expired) throw new Error("Renueva el código y toma las fotos de nuevo.");
    const ruta = `${userId}/${codigo.id}/${crypto.randomUUID()}.jpg`;
    const { error: uploadError } = await supabase.storage.from("lote-fotos").upload(ruta, blob, { contentType: "image/jpeg", upsert: false });
    if (uploadError) throw new Error("No pudimos guardar la foto. Inténtalo de nuevo.");
    onFotos([...fotos, { ruta, enVivo, preview: URL.createObjectURL(blob) }]);
  }
  async function capturar() {
    const element = video.current;
    if (!element || element.videoWidth === 0) return;
    setBusy(true); setError("");
    try { await guardar(await comprimir(element, element.videoWidth, element.videoHeight), true); }
    catch (e) { setError(e instanceof Error ? e.message : "No pudimos tomar la foto."); }
    finally { setBusy(false); }
  }
  async function alternativa(file: File | undefined) {
    if (!file) return;
    setBusy(true); setError("");
    try {
      if (!(TIPOS_FOTO as readonly string[]).includes(file.type)) throw new Error("Usa una imagen JPG, PNG o WebP.");
      const image = await createImageBitmap(file);
      try { await guardar(await comprimir(image, image.width, image.height), false); } finally { image.close(); }
    } catch (e) { setError(e instanceof Error ? e.message : "No pudimos preparar la foto."); }
    finally { setBusy(false); }
  }
  async function quitar(foto: FotoPendiente) {
    setBusy(true);
    const { error } = await supabase.storage.from("lote-fotos").remove([foto.ruta]);
    if (error) setError("No pudimos eliminar la foto.");
    else { URL.revokeObjectURL(foto.preview); onFotos(fotos.filter(f => f.ruta !== foto.ruta)); }
    setBusy(false);
  }

  return <section className="space-y-6">
    <div className="border-y border-border py-6">
      <h2 className="text-heading">Fotografía tu material</h2>
      <p className="mt-3">Escribe este código en un papel y fotografíalo junto al material.</p>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <strong className="font-display text-title tabular-nums">{codigo?.codigo ?? "····"}</strong>
        <p className="text-sm text-muted-foreground">{expired ? "El código venció. Renueva el código y vuelve a tomar las fotos." : codigo ? `Válido hasta ${fechaLima(codigo.expira_at)} (Lima)` : "Generando código…"}</p>
        <Button type="button" variant="outline" disabled={busy} onClick={renovar}><RefreshCw />{expired || !codigo ? "Generar código" : "Renovar código"}</Button>
      </div>
    </div>
    <p className="text-sm text-muted-foreground">Necesitas de 2 a 6 fotos. Ninguna web puede garantizar al 100% que una foto sea en vivo; por eso hay revisión. Esto ayuda a reducir el riesgo.</p>
    <div className="max-w-2xl">
      <video ref={video} muted playsInline aria-label="Vista de la cámara" className={cameraReady ? "aspect-[4/3] w-full rounded-md bg-muted object-cover" : "hidden"} />
      <div className="mt-3 flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={abrirCamara} disabled={busy || expired || !codigo}><Camera />{cameraReady ? "Reabrir cámara" : "Abrir cámara"}</Button>
        {cameraReady && <Button type="button" onClick={capturar} disabled={busy || expired || fotos.length >= MAX_FOTOS}><Camera />{busy ? "Guardando…" : "Tomar foto"}</Button>}
      </div>
      {fallback && <div className="mt-4"><label htmlFor="foto-alternativa" className="block text-sm font-medium">Captura alternativa (pasará a revisión)</label><input id="foto-alternativa" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy || expired || fotos.length >= MAX_FOTOS || !codigo} onChange={e => { void alternativa(e.target.files?.[0]); e.target.value = ""; }} className="mt-2 block max-w-full text-sm" /></div>}
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <p className="text-sm text-muted-foreground" aria-live="polite">{fotos.length} de 6 fotos</p>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {fotos.map((foto, i) => <figure key={foto.ruta} className="relative"><img src={foto.preview} alt={`Foto ${i + 1} de tu material`} className="aspect-[4/3] w-full rounded-md object-cover" /><figcaption className="mt-2 text-xs text-muted-foreground">{foto.enVivo ? "Capturada en esta página" : "Captura alternativa · revisión"}</figcaption><Button type="button" variant="outline" size="icon" aria-label={`Eliminar foto ${i + 1}`} title={`Eliminar foto ${i + 1}`} disabled={busy} className="absolute right-2 top-2" onClick={() => quitar(foto)}><Trash2 /></Button></figure>)}
    </div>
  </section>;
}