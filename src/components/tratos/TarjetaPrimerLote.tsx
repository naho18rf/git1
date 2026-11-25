import { Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { nombreCategoria } from "@/lib/materiales";
import { formatoKg, textoCompartir, type DatosTarjeta } from "@/lib/primer-lote";
import { generarTarjetaPng } from "@/lib/primer-lote-tarjeta";
import type { Trato } from "@/lib/tratos";

type Snapshot = { vendedora?: { nombre: string | null }; compradora?: { nombre: string | null } };

/** Solo en el navegador: el enlace de verificación usa el dominio actual. */
function datosDe(trato: Trato): DatosTarjeta | null {
  if (!trato.constancia || !trato.lote) return null;
  const snapshot = trato.constancia.snapshot as unknown as Snapshot;
  return {
    kg: Number(trato.lote.peso_kg),
    categoria: nombreCategoria(trato.lote.categoria),
    empresa: snapshot?.[trato.rol]?.nombre ?? null,
    numeroConstancia: trato.constancia.numero,
    urlVerificacion: `${window.location.origin}/constancia/${trato.constancia.numero}`,
  };
}

/** Tarjeta compartible con la que se celebra el primer trato completado de la empresa. */
export function TarjetaPrimerLote({ trato }: { trato: Trato }) {
  const [png, setPng] = useState<Blob | null>(null);
  const [vista, setVista] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    const datos = datosDe(trato);
    if (!datos) return undefined;
    let activo = true;
    let url: string | null = null;
    setError(null);
    generarTarjetaPng(datos)
      .then((blob) => {
        if (!activo) return;
        url = URL.createObjectURL(blob);
        setPng(blob);
        setVista(url);
      })
      .catch(() => {
        if (activo) setError("No pudimos crear la tarjeta. Recarga la página e inténtalo de nuevo.");
      });
    return () => {
      activo = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [trato]);

  if (!trato.constancia || !trato.lote) return null;
  const numero = trato.constancia.numero;
  const kg = formatoKg(Number(trato.lote.peso_kg));

  async function compartir() {
    const datos = datosDe(trato);
    if (!datos || !png) return;
    const texto = textoCompartir(datos);
    setAviso(null);
    try {
      const archivo = new File([png], `mi-primer-lote-${numero}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [archivo] })) {
        await navigator.share({ files: [archivo], title: "Mi primer lote en Remanente", text: texto });
      } else if (navigator.share) {
        await navigator.share({ title: "Mi primer lote en Remanente", text: texto });
      } else {
        await navigator.clipboard.writeText(texto);
        setAviso("Copiamos el texto. Descarga la imagen y pégalo en tu publicación.");
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // la persona cerró el menú de compartir
      setError("No pudimos abrir el menú de compartir. Descarga la imagen y publícala tú.");
    }
  }

  return (
    <section className="surface-card mt-8 p-5 md:p-6" aria-labelledby="titulo-primer-lote">
      <div className="grid gap-6 md:grid-cols-[minmax(0,260px)_1fr] md:items-center">
        {vista ? (
          <img
            src={vista}
            alt={`Tarjeta: Dimos una segunda vida a ${kg} kg. Constancia ${numero}.`}
            className="w-full max-w-[260px] rounded-2xl border border-border"
          />
        ) : (
          <div className="aspect-[4/5] w-full max-w-[260px] rounded-2xl bg-mint" aria-hidden="true" />
        )}
        <div>
          <p className="text-[13px] tracking-[0.16em] text-clay uppercase">Mi primer lote</p>
          <h2 id="titulo-primer-lote" className="mt-1 font-display text-2xl text-primary-deep">
            ¡Dieron una segunda vida a {kg} kg!
          </h2>
          <p className="measure mt-2 text-muted-foreground">
            Completaron su primera entrega en Remanente. Comparte esta tarjeta para mostrar que tu empresa ya hace
            economía circular.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={() => void compartir()} disabled={!png}>
              <Share2 className="h-4 w-4" aria-hidden="true" /> Compartir
            </Button>
            {vista && (
              <Button asChild variant="outline">
                <a href={vista} download={`mi-primer-lote-${numero}.png`}>
                  <Download className="h-4 w-4" aria-hidden="true" /> Descargar imagen
                </a>
              </Button>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            El enlace de verificación muestra los nombres de ambas empresas, la categoría y el peso aproximado.
            Peso aproximado declarado en el lote; no es una certificación ambiental oficial.
          </p>
          {aviso && (
            <p role="status" className="mt-3 text-sm text-primary-deep">
              {aviso}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
