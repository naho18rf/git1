import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { analizarMerma } from "@/lib/analisis-merma.functions";
import { MAX_BYTES_FOTO_ANALISIS, MAX_FOTOS_ANALISIS } from "@/lib/analisis-merma-reglas";
import { MATERIALES_PERMITIDOS } from "@/lib/materiales";

import type { Detalles } from "./DetallesLote";

async function comprimir(file: File): Promise<File> {
  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No pudimos preparar la foto.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.8, 0.65, 0.5, 0.35]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= MAX_BYTES_FOTO_ANALISIS) return new File([blob], "foto.jpg", { type: "image/jpeg" });
    }
    throw new Error("Una foto es demasiado grande. Prueba con otra imagen.");
  } finally {
    image.close();
  }
}

type Sugerencia = { aviso: string; limitaciones: string; confianza: string; completado: boolean; nota: string };

/** Sugiere categoría y descripción con IA a partir de fotos. Todo queda editable; no estima peso ni precio. */
export function SugerirFichaIA({ value, onChange }: { value: Detalles; onChange: (v: Detalles) => void }) {
  const analizar = useServerFn(analizarMerma);
  const [files, setFiles] = useState<File[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [sugerencia, setSugerencia] = useState<Sugerencia | null>(null);

  async function sugerir() {
    if (files.length === 0) return;
    setError("");
    setSugerencia(null);
    setOcupado(true);
    try {
      const data = new FormData();
      for (const file of files) data.append("fotos", await comprimir(file));
      const r = await analizar({ data });
      const claves = MATERIALES_PERMITIDOS.map((m) => m.clave) as string[];
      const confiable = r.confianza !== "baja" && !!r.categoria && claves.includes(r.categoria);
      if (confiable) {
        const texto = `${r.nombre_material}. ${r.descripcion}${r.condicion ? ` Condición: ${r.condicion}` : ""}`.slice(0, 1000);
        onChange({ ...value, categoria: r.categoria ?? "", descripcion: texto });
      }
      setSugerencia({
        aviso: r.aviso_manejo ?? "",
        limitaciones: r.no_se_puede_saber ?? "",
        confianza: r.confianza,
        completado: confiable,
        nota: confiable ? "" : r.recomendaciones ?? "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos analizar las fotos. Puedes completar los datos a mano.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="mb-8 rounded-lg bg-pale-mint p-5">
      <p className="flex items-center gap-2 font-medium text-primary-deep">
        <Sparkles className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> Sugerir ficha con IA (opcional)
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Sube hasta {MAX_FOTOS_ANALISIS} fotos del material y la IA propondrá categoría y descripción. Tú revisas y editas todo; el peso y el empaque los escribes tú.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          aria-label="Fotos para la sugerencia con IA"
          className="text-sm"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, MAX_FOTOS_ANALISIS))}
        />
        <Button type="button" variant="outline" disabled={files.length === 0 || ocupado} onClick={() => void sugerir()}>
          {ocupado ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
          {ocupado ? "Analizando…" : "Sugerir ficha"}
        </Button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      {sugerencia && (
        <div role="status" className="mt-3 space-y-2 text-sm text-foreground">
          {sugerencia.completado ? (
            <p>Completamos la categoría y la descripción (confianza {sugerencia.confianza}). Revísalas antes de continuar.</p>
          ) : (
            <p>No pudimos identificar el material con seguridad. Completa los datos a mano. {sugerencia.nota}</p>
          )}
          {sugerencia.aviso && <p className="rounded-md bg-rose-pale p-3 font-medium">{sugerencia.aviso}</p>}
          {sugerencia.limitaciones && <p className="text-muted-foreground">Limitaciones: {sugerencia.limitaciones}</p>}
        </div>
      )}
    </div>
  );
}
