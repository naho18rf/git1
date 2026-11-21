import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Handshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccionesTrato } from "@/components/tratos/AccionesTrato";
import { fechaLima } from "@/lib/lotes";
import { nombreCategoria } from "@/lib/materiales";
import { misTratosQuery, type Trato } from "@/lib/tratos";
import { contarPendientes, ESTADO_TRATO_LABEL } from "@/lib/tratos-reglas";

export const Route = createFileRoute("/_authenticated/panel/tratos")({
  head: () => ({ meta: [{ title: "Mis tratos · Panel · Remanente" }] }),
  component: TratosPage,
});

function TratosPage() {
  const { user } = Route.useRouteContext();
  const { data = [], isLoading, error } = useQuery(misTratosQuery(user.id));
  const compras = data.filter((t) => t.rol === "compradora");
  const ventas = data.filter((t) => t.rol === "vendedora");
  const pend = (l: Trato[]) => contarPendientes(l);

  return (
    <div>
      <h1 className="text-title text-primary-deep">Mis tratos</h1>
      <p className="measure mt-4 text-muted-foreground">Sigue tus solicitudes y entregas. Los datos de contacto se comparten solo cuando el trato se acepta.</p>
      {isLoading ? <p className="mt-8 text-muted-foreground">Cargando tus tratos…</p> : error ? <p role="alert" className="mt-8 text-destructive">No pudimos cargar tus tratos.</p> : (
        <Tabs defaultValue={pend(ventas) > pend(compras) ? "vendedora" : "compradora"} className="mt-8">
          <TabsList>
            <TabsTrigger value="compradora">Como compradora{pend(compras) ? ` (${pend(compras)})` : ""}</TabsTrigger>
            <TabsTrigger value="vendedora">Como vendedora{pend(ventas) ? ` (${pend(ventas)})` : ""}</TabsTrigger>
          </TabsList>
          <TabsContent value="compradora"><Lista tratos={compras} rol="compradora" /></TabsContent>
          <TabsContent value="vendedora"><Lista tratos={ventas} rol="vendedora" /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function Lista({ tratos, rol }: { tratos: Trato[]; rol: "compradora" | "vendedora" }) {
  if (!tratos.length) {
    return (
      <div className="surface-card mt-6 flex flex-col items-start gap-4 p-8">
        <Handshake className="h-6 w-6 text-clay" strokeWidth={1.5} aria-hidden="true" />
        <h2 className="font-display text-2xl text-primary-deep">{rol === "compradora" ? "Aún no has solicitado lotes" : "Aún no tienes solicitudes"}</h2>
        <p className="measure text-muted-foreground">{rol === "compradora" ? "Explora el mercado y solicita lo que le sirva a tu planta." : "Cuando otra empresa solicite uno de tus lotes, aparecerá aquí."}</p>
        <Button asChild variant="outline"><Link to={rol === "compradora" ? "/panel/mercado" : "/panel/publicar"}>{rol === "compradora" ? "Ir al mercado" : "Publicar un lote"}</Link></Button>
      </div>
    );
  }
  return (
    <ul className="mt-6 space-y-4">
      {tratos.map((t) => (
        <li key={t.id} className="surface-card p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[13px] tracking-[0.16em] text-clay uppercase">{t.lote ? nombreCategoria(t.lote.categoria) : "Lote"}</p>
              <p className="mt-1 font-display text-xl text-primary-deep">
                {t.lote ? <Link to="/lote/$codigo" params={{ codigo: t.lote.codigo }} className="underline-offset-4 hover:underline">{t.lote.codigo}</Link> : "—"} · {t.lote?.peso_kg} kg aprox.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{rol === "compradora" ? "Vende" : "Solicita"}: {t.otra.nombre_empresa ?? "Empresa"} · {fechaLima(t.created_at)} (Lima)</p>
            </div>
            <span className="rounded-full border border-border bg-mint px-3 py-1 text-sm">{ESTADO_TRATO_LABEL[t.estado]}</span>
          </div>
          {(t.mensaje || t.recogida) && (
            <p className="mt-3 text-sm"><span className="text-muted-foreground">Recojo:</span> {t.recogida}{t.mensaje ? <><br /><span className="text-muted-foreground">Mensaje:</span> {t.mensaje}</> : null}</p>
          )}
          {t.otra.contacto && (
            <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-3">
              <div><dt className="text-muted-foreground">Representante</dt><dd>{t.otra.representante ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Teléfono</dt><dd>{t.otra.telefono ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Correo</dt><dd className="break-all">{t.otra.correo ?? "—"}</dd></div>
            </dl>
          )}
          {t.entregada_at && <p className="mt-3 text-sm text-muted-foreground">Entregado: {fechaLima(t.entregada_at)} (Lima)</p>}
          {t.estado === "con_problema" && (
            <p role="status" className="mt-4 flex gap-2 rounded-md border border-destructive/40 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
              La empresa compradora reportó un problema con la entrega. El equipo de Remanente lo revisará.{t.problema_detalle ? ` Detalle: ${t.problema_detalle}` : ""}
            </p>
          )}
          {t.constancia && <p className="mt-3 text-sm">Constancia <strong>{t.constancia.numero}</strong> · {fechaLima(t.constancia.emitida_at)} (Lima)</p>}
          <div className="mt-4"><AccionesTrato trato={t} /></div>
        </li>
      ))}
    </ul>
  );
}
