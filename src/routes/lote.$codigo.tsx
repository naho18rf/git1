import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site/PageShell";
import { ReportarLote } from "@/components/lotes/ReportarLote";
import { SolicitarLote } from "@/components/tratos/SolicitarLote";
import { TratoEnLote } from "@/components/tratos/TratoEnLote";
import { useAuth } from "@/lib/auth";
import { ESTADO_LABEL, fechaLima, pasaporteQuery } from "@/lib/lotes";
import { nombreCategoria } from "@/lib/materiales";
import { puedeSolicitarLote } from "@/lib/tratos-reglas";

export const Route = createFileRoute("/lote/$codigo")({
  validateSearch: (search: Record<string, unknown>): { solicitar?: 1 } =>
    search["solicitar"] === "1" ? { solicitar: 1 } : {},
  loader: ({ params, context }) => context.queryClient.ensureQueryData(pasaporteQuery(params.codigo)),
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${loaderData.codigo} · Pasaporte de lote · Remanente`
      : "Lote no disponible · Remanente";
    const description = loaderData
      ? `${nombreCategoria(loaderData.categoria)} · ${loaderData.peso_kg} kg aprox. · ${loaderData.distrito}. Registro de lote en Remanente.`
      : "Este lote no está disponible públicamente en Remanente.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: PasaportePage,
});

function PasaportePage() {
  const { codigo } = Route.useParams();
  const { solicitar } = Route.useSearch();
  const { data: lote } = useSuspenseQuery(pasaporteQuery(codigo));
  const { session, ready } = useAuth();
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/lote/${codigo}`);
  }, [codigo]);

  function descargarQR() {
    const canvas = document.getElementById("qr-lote") as HTMLCanvasElement | null;
    if (!canvas) return;
    const enlace = document.createElement("a");
    enlace.href = canvas.toDataURL("image/png");
    enlace.download = `qr-${codigo}.png`;
    enlace.click();
  }

  if (!lote) {
    return (
      <PageShell>
        <div className="mx-auto max-w-5xl px-5 py-12 md:px-8">
          <h1 className="text-title">Lote no disponible</h1>
          <p className="mt-5 text-muted-foreground">Este lote aún no está publicado o fue retirado.</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const datos: [string, string][] = [
    ["Peso aproximado", `${lote.peso_kg} kg`],
    ["Empaque", lote.empaque],
    ["Distrito", lote.distrito],
    ["Empresa", lote.nombre_empresa],
    ["Publicación (hora de Lima)", fechaLima(lote.publicado_at)],
    ["Estado", ESTADO_LABEL[lote.estado]],
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-[13px] tracking-[0.16em] text-clay uppercase">Pasaporte de lote · registro de Remanente</p>
        <h1 className="mt-3 text-title text-primary-deep">{lote.codigo}</h1>
        <p className="mt-3 text-lg">
          {nombreCategoria(lote.categoria)} · {ESTADO_LABEL[lote.estado]}
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div className="min-w-0">
            <ul className="grid gap-4 sm:grid-cols-2">
              {lote.fotos.map((foto, i) => (
                <li key={foto}>
                  <img
                    src={foto}
                    alt={`Foto ${i + 1} del lote ${lote.codigo}`}
                    className="aspect-[4/3] w-full rounded-md object-cover"
                  />
                </li>
              ))}
            </ul>

            <p className="mt-8 whitespace-pre-wrap measure">{lote.descripcion}</p>

            <dl className="mt-8 grid gap-5 border-y border-border py-6 sm:grid-cols-2">
              {datos.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="mt-1">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-sm text-muted-foreground">
              Registro de Remanente. No es una certificación ambiental oficial.
            </p>

            {ready && session && <TratoEnLote codigo={lote.codigo} userId={session.user.id} />}

            {puedeSolicitarLote({
              tieneSesion: !!session,
              esDueno: !!session && lote.empresa_id === session.user.id,
              estado: lote.estado,
            }) && (
              <div className="mt-8">
                <SolicitarLote loteId={lote.id} codigo={lote.codigo} autoAbrir={solicitar === 1} />
              </div>
            )}

            {!session && ready && (
              <div className="surface-card mt-8 p-6">
                <p className="font-display text-xl text-primary-deep">
                  Para contactar a la empresa o cerrar un trato, inicia sesión o regístrate
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/auth">Ingresar</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/registro">Registrar mi empresa</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="surface-card h-fit p-6 lg:sticky lg:top-24">
            <p className="text-[13px] tracking-[0.16em] text-clay uppercase">Código QR del lote</p>
            <div className="mt-4 grid place-items-center rounded-md bg-mint p-4">
              {url ? (
                <QRCodeCanvas id="qr-lote" value={url} size={168} marginSize={2} />
              ) : (
                <span className="h-[168px] w-[168px]" aria-hidden="true" />
              )}
            </div>
            <p className="mt-3 break-all text-xs text-muted-foreground">{url}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Button onClick={descargarQR} disabled={!url}>
                <Download strokeWidth={1.5} /> Descargar QR
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer strokeWidth={1.5} /> Imprimir
              </Button>
              {ready && session && <ReportarLote loteId={lote.id} />}
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
