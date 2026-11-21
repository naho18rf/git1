import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Check, Pencil, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { empresaQuery } from "@/lib/empresa";
import { MATERIALES_PERMITIDOS, MATERIALES_NO_PERMITIDOS, NOTA_LISTA_MATERIALES, nombreCategoria } from "@/lib/materiales";
import { misLotesQuery, ESTADO_LABEL, fechaLima } from "@/lib/lotes";
import { publicarLote, retirarLote, editarLote } from "@/lib/lotes.functions";
import { publicarLoteSchema } from "@/lib/lotes-reglas";
import type { Tables } from "@/integrations/supabase/types";
import { CamaraLote, type CodigoFoto, type FotoPendiente } from "./CamaraLote";
import { DetallesLote, type Detalles } from "./DetallesLote";

export function PublicarLoteForm({ userId }: { userId: string }) {
  const { data: empresa } = useQuery(empresaQuery(userId));
  const { data: lotes = [], isLoading, error: listError } = useQuery(misLotesQuery(userId));
  const client = useQueryClient();
  const publish = useServerFn(publicarLote); const withdraw = useServerFn(retirarLote); const edit = useServerFn(editarLote);
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Detalles>({ categoria: "", descripcion: "", peso_kg: "", empaque: "", distrito: "" });
  const [fotos, setFotos] = useState<FotoPendiente[]>([]);
  const [codigo, setCodigo] = useState<CodigoFoto | null>(null);
  const [declaracion, setDeclaracion] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<Tables<"lotes"> | null>(null);
  const [editDetails, setEditDetails] = useState<Detalles>({ categoria: "", descripcion: "", peso_kg: "", empaque: "", distrito: "" });
  useEffect(() => { if (empresa?.distrito) setDetails(prev => prev.distrito ? prev : { ...prev, distrito: empresa.distrito ?? "" }); }, [empresa?.distrito]);
  async function refresh() { await client.invalidateQueries({ queryKey: ["mis-lotes", userId] }); await client.invalidateQueries({ queryKey: ["mercado"] }); }
  async function submit() {
    setError(""); setSuccess("");
    const parsed = publicarLoteSchema.safeParse({ ...details, declaracion, codigoId: codigo?.id, fotos: fotos.map(({ ruta, enVivo }) => ({ ruta, enVivo })) });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revisa los datos."); return; }
    setBusy(true);
    try {
      const lote = await publish({ data: parsed.data });
      setSuccess(lote.estado === "en_revision" ? `${lote.codigo}: tu lote quedó en revisión. Aún no se muestra en el mercado.` : `${lote.codigo}: tu lote ya está publicado.`);
      fotos.forEach(f => URL.revokeObjectURL(f.preview)); setFotos([]); setCodigo(null); setDeclaracion(false); setStep(0);
      setDetails({ categoria: "", descripcion: "", peso_kg: "", empaque: "", distrito: empresa?.distrito ?? "" }); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "No pudimos publicar el lote."); }
    finally { setBusy(false); }
  }
  async function retirar(id: string) {
    if (!window.confirm("¿Quieres retirar este lote? Dejará de mostrarse en el mercado.")) return;
    setBusy(true); setError("");
    try { await withdraw({ data: id }); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : "No pudimos retirar el lote."); } finally { setBusy(false); }
  }
  async function guardarEdicion() {
    if (!editing) return; setBusy(true); setError("");
    try { await edit({ data: { id: editing.id, descripcion: editDetails.descripcion, peso_kg: Number(editDetails.peso_kg), empaque: editDetails.empaque, distrito: editDetails.distrito } }); setEditing(null); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Revisa los datos."); } finally { setBusy(false); }
  }
  return <div>
    <h1 className="text-title text-primary-deep">Publicar lote</h1>
    {success && <p role="status" className="mt-6 rounded-md border border-border bg-mint p-4">{success}</p>}
    {error && <p role="alert" className="mt-6 text-destructive">{error}</p>}
    <ol className="mt-8 flex flex-wrap gap-6 border-b border-border pb-5 text-sm" aria-label="Pasos de publicación">{["Materiales", "Datos del lote", "Fotos y declaración"].map((label, i) => <li key={label} aria-current={step === i ? "step" : undefined} className={step === i ? "font-semibold text-primary" : "text-muted-foreground"}>{i + 1}. {label}</li>)}</ol>
    <div className="mt-8">
      {step === 0 && <section><h2 className="text-heading">Materiales que puedes publicar</h2><dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">{MATERIALES_PERMITIDOS.map(m => <div key={m.clave}><dt className="font-medium">{m.nombre}</dt><dd className="mt-1 text-sm text-muted-foreground">{m.descripcion}</dd></div>)}</dl><h2 className="mt-10 text-heading text-clay">Materiales no permitidos</h2><ul className="mt-5 space-y-3 text-sm">{MATERIALES_NO_PERMITIDOS.map(m => <li key={m.grupo}><strong>{m.grupo}:</strong> <span className="text-muted-foreground">{m.detalle}</span></li>)}</ul><p className="mt-6 text-sm text-muted-foreground">{NOTA_LISTA_MATERIALES}</p><Button className="mt-8" onClick={() => { setStep(1); setError(""); }}>Continuar <ArrowRight /></Button></section>}
      {step === 1 && <form onSubmit={e => { e.preventDefault(); setStep(2); setError(""); }} className="max-w-3xl"><DetallesLote value={details} onChange={setDetails} /><div className="mt-8 flex gap-3"><Button type="button" variant="outline" onClick={() => setStep(0)}><ArrowLeft />Volver</Button><Button type="submit">Continuar a fotos <ArrowRight /></Button></div></form>}
      {step === 2 && <div><CamaraLote userId={userId} fotos={fotos} onFotos={setFotos} codigo={codigo} onCodigo={setCodigo} /><div className="mt-8 flex items-start gap-3"><Checkbox id="declaracion" checked={declaracion} onCheckedChange={v => setDeclaracion(v === true)} /><label htmlFor="declaracion" className="text-sm">Confirmo que este lote no contiene materiales no permitidos y que tengo derecho a ofrecerlo.{details.categoria === "madera" && <span className="mt-2 block">Declaro que la madera tiene procedencia legal.</span>}</label></div><div className="mt-8 flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={() => setStep(1)}><ArrowLeft />Volver</Button><Button disabled={busy || fotos.length < 2 || !declaracion} onClick={submit}><PackagePlus />{busy ? "Guardando…" : "Enviar lote"}</Button></div></div>}
    </div>
    <section className="mt-16 border-t border-border pt-8"><h2 className="text-heading">Tus lotes</h2>{isLoading ? <p className="mt-5">Cargando tus lotes…</p> : listError ? <p role="alert" className="mt-5 text-destructive">No pudimos cargar tus lotes.</p> : !lotes.length ? <p className="mt-5 text-muted-foreground">Todavía no has publicado lotes. Aquí verás su estado cuando envíes el primero.</p> : <ul className="mt-5 divide-y divide-border">{lotes.map(l => <li key={l.id} className="py-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-medium">{l.codigo} · {nombreCategoria(l.categoria)}</p><p className="mt-1 text-sm text-muted-foreground">{l.peso_kg} kg aprox. · {l.distrito} · {ESTADO_LABEL[l.estado]}</p><p className="mt-1 text-xs text-muted-foreground">{fechaLima(l.created_at)} (Lima)</p>{l.motivo_rechazo && <p className="mt-2 text-sm text-clay">Motivo del rechazo: {l.motivo_rechazo}</p>}</div><div className="flex flex-wrap gap-2">{["publicado", "reservado", "entregado"].includes(l.estado) && <Button asChild variant="outline" size="sm"><Link to="/lote/$codigo" params={{ codigo: l.codigo }}>Ver pasaporte</Link></Button>}{l.estado === "en_revision" && <Button variant="outline" size="sm" disabled={busy} onClick={() => { setEditing(l); setEditDetails({ categoria: l.categoria, descripcion: l.descripcion, peso_kg: String(l.peso_kg), empaque: l.empaque, distrito: l.distrito }); }}><Pencil />Editar</Button>}{["en_revision", "publicado"].includes(l.estado) && <Button variant="ghost" size="sm" disabled={busy} onClick={() => retirar(l.id)}>Retirar</Button>}</div></div>{editing?.id === l.id && <form className="mt-6 max-w-3xl border-t border-border pt-5" onSubmit={e => { e.preventDefault(); void guardarEdicion(); }}><DetallesLote categoria={false} value={editDetails} onChange={setEditDetails} /><div className="mt-5 flex gap-3"><Button disabled={busy}><Check />Guardar cambios</Button><Button variant="outline" type="button" onClick={() => setEditing(null)}>Cancelar</Button></div></form>}</li>)}</ul>}</section>
  </div>;
}