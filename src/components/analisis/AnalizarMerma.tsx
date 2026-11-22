import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Check, ImagePlus, LoaderCircle, Sparkles, SwitchCamera, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/integrations/supabase/types";
import { analisisMermaQuery } from "@/lib/analisis-merma";
import { analizarMerma, actualizarFichaMerma } from "@/lib/analisis-merma.functions";
import {
  MAX_BYTES_FOTO_ANALISIS,
  MAX_FOTOS_ANALISIS,
  actualizarFichaSchema,
  cantidadFotosValida,
  fichaMermaSchema,
} from "@/lib/analisis-merma-reglas";
import { fechaLima } from "@/lib/lotes";
import { MATERIALES_PERMITIDOS, nombreCategoria } from "@/lib/materiales";

const selectClass = "mt-2 h-11 w-full rounded-md border border-input bg-surface px-3 text-sm";

type AnalisisConFoto = Tables<"analisis_merma"> & {
  foto_url: string | null;
  fotos_urls: string[];
};
type Borrador = {
  nombre_material: string;
  categoria: string;
  descripcion: string;
  condicion: string;
  usosTexto: string;
  recomendaciones: string;
  noSePuedeSaber: string;
  avisoTexto: string;
};

function borradorDe(analisis: Tables<"analisis_merma">): Borrador {
  const ficha = fichaMermaSchema.parse({
    nombre_material: analisis.nombre_material,
    categoria: analisis.categoria,
    descripcion: analisis.descripcion,
    condicion: analisis.condicion,
    usos_posibles: analisis.usos_posibles,
    recomendaciones: analisis.recomendaciones,
    confianza: analisis.confianza,
    no_se_puede_saber: analisis.no_se_puede_saber,
    aviso_manejo: analisis.aviso_manejo,
  });
  return {
    nombre_material: ficha.nombre_material,
    categoria: ficha.categoria ?? "",
    descripcion: ficha.descripcion,
    condicion: ficha.condicion,
    usosTexto: ficha.usos_posibles.join("\n"),
    recomendaciones: ficha.recomendaciones,
    noSePuedeSaber: ficha.no_se_puede_saber,
    avisoTexto: ficha.aviso_manejo ?? "",
  };
}

async function comprimirOrigen(
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<Blob> {
  const scale = Math.min(1, 1600 / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No pudimos preparar la foto.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.8, 0.65, 0.5, 0.35]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (blob && blob.size <= MAX_BYTES_FOTO_ANALISIS) return blob;
  }
  throw new Error("La foto es demasiado grande. Prueba con otra imagen.");
}

async function comprimirFoto(file: File): Promise<Blob> {
  const image = await createImageBitmap(file);
  try {
    return await comprimirOrigen(image, image.width, image.height);
  } finally {
    image.close();
  }
}

export function AnalizarMerma({ userId }: { userId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const queryClient = useQueryClient();
  const {
    data: historial = [],
    isLoading,
    error: errorHistorial,
  } = useQuery(analisisMermaQuery(userId));
  const analyze = useServerFn(analizarMerma);
  const save = useServerFn(actualizarFichaMerma);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [actual, setActual] = useState<AnalisisConFoto | null>(null);
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [ocupado, setOcupado] = useState<"analizando" | "guardando" | "foto" | null>(null);
  const [sucio, setSucio] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  function detenerCamara() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamaraActiva(false);
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function cambiarPreviews(urls: string[]) {
    previews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    setPreviews(urls);
  }

  function confirmarDescarte(): boolean {
    return !sucio || window.confirm("Tienes cambios sin guardar. ¿Quieres descartarlos?");
  }

  async function abrirCamara(modo: "environment" | "user" = facingMode) {
    if (!confirmarDescarte()) return;
    setError("");
    setMensaje("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Tu navegador no permite abrir la cámara directamente. Usa 'Subir archivo'.",
        );
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: modo }, width: { ideal: 1600 } },
        audio: false,
      });
      streamRef.current = media;
      setFacingMode(modo);
      setCamaraActiva(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          void videoRef.current.play();
        }
      });
    } catch (e) {
      detenerCamara();
      setError(
        e instanceof Error && e.message.includes("navegador")
          ? e.message
          : "No pudimos acceder a la cámara. Revisa los permisos o usa el botón 'Subir archivo'.",
      );
    }
  }

  async function capturarDesdeCamara() {
    const videoEl = videoRef.current;
    if (!videoEl || videoEl.videoWidth === 0) return;
    setError("");
    setMensaje("");
    setOcupado("foto");
    try {
      const blob = await comprimirOrigen(videoEl, videoEl.videoWidth, videoEl.videoHeight);
      const preparado = new File([blob], "escaneo-merma.jpg", { type: "image/jpeg" });
      detenerCamara();
      cambiarPreviews([URL.createObjectURL(blob)]);
      setFiles([preparado]);
      setActual(null);
      setBorrador(null);
      setSucio(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos capturar la imagen.");
    } finally {
      setOcupado(null);
    }
  }

  async function seleccionar(seleccionados: FileList | null) {
    const elegidos = Array.from(seleccionados ?? []);
    if (elegidos.length === 0) return;
    if (!confirmarDescarte()) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (!cantidadFotosValida(elegidos.length)) {
      setError(`Selecciona entre 1 y ${MAX_FOTOS_ANALISIS} fotos del mismo residuo.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    detenerCamara();
    setError("");
    setMensaje("");
    setOcupado("foto");
    try {
      const preparados = await Promise.all(
        elegidos.map(async (elegido, indice) => {
          if (!["image/jpeg", "image/png", "image/webp"].includes(elegido.type)) {
            throw new Error("Usa imágenes JPG, PNG o WebP.");
          }
          const blob = await comprimirFoto(elegido);
          return {
            blob,
            file: new File([blob], `merma-${indice + 1}.jpg`, { type: "image/jpeg" }),
          };
        }),
      );
      cambiarPreviews(preparados.map((preparado) => URL.createObjectURL(preparado.blob)));
      setFiles(preparados.map((preparado) => preparado.file));
      setActual(null);
      setBorrador(null);
      setSucio(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos preparar las fotos.");
    } finally {
      setOcupado(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function analizar() {
    if (files.length === 0) return;
    setError("");
    setMensaje("");
    setOcupado("analizando");
    try {
      const data = new FormData();
      files.forEach((file) => data.append("fotos", file));
      const resultado = await analyze({ data });
      setActual(resultado);
      setBorrador(borradorDe(resultado));
      setFiles([]);
      setSucio(false);
      setMensaje("La sugerencia está lista y se guardó en tu historial. Revísala antes de usarla.");
      await queryClient.invalidateQueries({ queryKey: ["analisis-merma", userId] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos analizar las fotos.");
    } finally {
      setOcupado(null);
    }
  }

  function editar<K extends keyof Borrador>(campo: K, valor: Borrador[K]) {
    if (!borrador) return;
    setBorrador({ ...borrador, [campo]: valor });
    setSucio(true);
    setMensaje("");
  }

  async function guardar() {
    if (!actual || !borrador) return;
    setError("");
    setMensaje("");
    const parsed = actualizarFichaSchema.safeParse({
      id: actual.id,
      nombre_material: borrador.nombre_material,
      categoria: borrador.categoria || null,
      descripcion: borrador.descripcion,
      condicion: borrador.condicion,
      usos_posibles: borrador.usosTexto
        .split("\n")
        .map((uso) => uso.trim())
        .filter(Boolean),
      recomendaciones: borrador.recomendaciones,
      no_se_puede_saber: borrador.noSePuedeSaber,
      aviso_manejo: borrador.avisoTexto.trim() || null,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa la ficha.");
      return;
    }
    setOcupado("guardando");
    try {
      const actualizado = await save({ data: parsed.data });
      setActual({
        ...actualizado,
        foto_url: actual.foto_url,
        fotos_urls: actual.fotos_urls,
      });
      setBorrador(borradorDe(actualizado));
      setSucio(false);
      setMensaje("Cambios guardados.");
      await queryClient.invalidateQueries({ queryKey: ["analisis-merma", userId] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos guardar los cambios.");
    } finally {
      setOcupado(null);
    }
  }

  function abrirAnalisis(analisis: AnalisisConFoto) {
    if (!confirmarDescarte()) return;
    detenerCamara();
    setActual(analisis);
    setBorrador(borradorDe(analisis));
    setFiles([]);
    cambiarPreviews(
      analisis.fotos_urls.length > 0
        ? analisis.fotos_urls
        : analisis.foto_url
          ? [analisis.foto_url]
          : [],
    );
    setSucio(false);
    setError("");
    setMensaje("");
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="space-y-12">
      <header>
        <p className="text-sm font-medium text-clay">Hasta 3 fotos como punto de partida</p>
        <h1 className="mt-2 text-title text-primary-deep">Analizar merma</h1>
        <p className="measure mt-4 text-lead text-muted-foreground">
          Escanea el material con tu cámara o sube hasta 3 fotos del mismo residuo y recibe una
          ficha sugerida. Puedes corregir cada dato antes de usarlo.
        </p>
      </header>

      <section
        className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
        aria-label="Nuevo análisis"
      >
        <div>
          <div className="surface-card relative overflow-hidden">
            {camaraActiva ? (
              <div className="relative aspect-[4/3] w-full bg-black">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  aria-label="Visor de escáner de material"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-dashed border-white/75"
                />
                <button
                  type="button"
                  onClick={() =>
                    void abrirCamara(facingMode === "environment" ? "user" : "environment")
                  }
                  aria-label="Cambiar cámara"
                  className="absolute right-3 top-3 rounded-full bg-black/60 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/80"
                >
                  <SwitchCamera className="h-5 w-5" />
                </button>
              </div>
            ) : previews.length > 0 ? (
              <div className={previews.length > 1 ? "grid grid-cols-3 gap-1" : ""}>
                {previews.map((url, indice) => (
                  <img
                    key={url}
                    src={url}
                    alt={`Material seleccionado, foto ${indice + 1} de ${previews.length}`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center bg-pale-mint p-8 text-center">
                <div>
                  <Camera
                    className="mx-auto h-9 w-9 text-primary"
                    strokeWidth={1.25}
                    aria-hidden="true"
                  />
                  <p className="mt-4 font-display text-2xl text-primary-deep">
                    Escanea un solo tipo de material
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Con buena luz, de cerca y sin elementos que lo tapen.
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            id="foto-analisis"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            disabled={ocupado !== null}
            onChange={(event) => void seleccionar(event.target.files)}
          />

          <div className="mt-4 flex flex-wrap gap-3">
            {camaraActiva ? (
              <>
                <Button
                  type="button"
                  disabled={ocupado !== null}
                  onClick={() => void capturarDesdeCamara()}
                >
                  <Camera />
                  Capturar material
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={ocupado !== null}
                  onClick={detenerCamara}
                >
                  <X />
                  Cerrar cámara
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={ocupado !== null}
                  onClick={() => void abrirCamara()}
                >
                  <Camera />
                  Escanear con cámara
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={ocupado !== null}
                  onClick={() => inputRef.current?.click()}
                >
                  <ImagePlus />
                  Subir fotos
                </Button>
                <Button
                  type="button"
                  disabled={files.length === 0 || ocupado !== null}
                  onClick={() => void analizar()}
                >
                  {ocupado === "analizando" ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Sparkles />
                  )}
                  {ocupado === "analizando" ? "Analizando fotos…" : "Analizar material"}
                </Button>
              </>
            )}
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            JPG, PNG o WebP. Hasta 3 fotos del mismo residuo; cada una se ajusta a un máximo de 1.5
            MB.
          </p>
          <div aria-live="polite">
            {ocupado === "foto" && (
              <p className="mt-4 text-sm text-muted-foreground">Preparando las fotos…</p>
            )}
            {ocupado === "analizando" && (
              <p className="mt-4 text-sm text-muted-foreground">
                Estamos observando el material. Esto puede tomar unos segundos.
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0">
          {borrador && actual ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void guardar();
              }}
              className="surface-card p-5 sm:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-2xl text-primary-deep">Ficha sugerida</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Edita lo que necesites y guarda tus cambios.
                  </p>
                </div>
                <Badge variant={actual.confianza === "baja" ? "rose" : "mint"}>
                  Confianza {actual.confianza}
                </Badge>
              </div>
              <div className="mt-6 grid gap-5">
                <div>
                  <label htmlFor="nombre-material" className="text-sm font-medium">
                    Material identificado
                  </label>
                  <Input
                    id="nombre-material"
                    required
                    maxLength={120}
                    value={borrador.nombre_material}
                    onChange={(e) => editar("nombre_material", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label htmlFor="categoria-analisis" className="text-sm font-medium">
                    Categoría sugerida
                  </label>
                  <select
                    id="categoria-analisis"
                    value={borrador.categoria}
                    onChange={(e) => editar("categoria", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">No identificada</option>
                    {MATERIALES_PERMITIDOS.map((material) => (
                      <option key={material.clave} value={material.clave}>
                        {material.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="descripcion-analisis" className="text-sm font-medium">
                    Descripción
                  </label>
                  <Textarea
                    id="descripcion-analisis"
                    required
                    maxLength={1000}
                    value={borrador.descripcion}
                    onChange={(e) => editar("descripcion", e.target.value)}
                    className="mt-2 min-h-28"
                  />
                </div>
                <div>
                  <label htmlFor="condicion-analisis" className="text-sm font-medium">
                    Estado visible
                  </label>
                  <Textarea
                    id="condicion-analisis"
                    required
                    maxLength={500}
                    value={borrador.condicion}
                    onChange={(e) => editar("condicion", e.target.value)}
                    className="mt-2 min-h-24"
                  />
                </div>
                <div>
                  <label htmlFor="usos-analisis" className="text-sm font-medium">
                    Usos posibles
                  </label>
                  <Textarea
                    id="usos-analisis"
                    maxLength={850}
                    value={borrador.usosTexto}
                    onChange={(e) => editar("usosTexto", e.target.value)}
                    className="mt-2 min-h-28"
                    aria-describedby="ayuda-usos"
                  />
                  <p id="ayuda-usos" className="mt-2 text-sm text-muted-foreground">
                    Escribe un uso por línea, hasta 5.
                  </p>
                </div>
                <div>
                  <label htmlFor="recomendaciones-analisis" className="text-sm font-medium">
                    Recomendaciones de manejo y almacenamiento
                  </label>
                  <Textarea
                    id="recomendaciones-analisis"
                    required
                    maxLength={1000}
                    value={borrador.recomendaciones}
                    onChange={(e) => editar("recomendaciones", e.target.value)}
                    className="mt-2 min-h-28"
                  />
                </div>
                <div>
                  <label htmlFor="limitaciones-analisis" className="text-sm font-medium">
                    Qué no se puede saber desde la foto
                  </label>
                  <Textarea
                    id="limitaciones-analisis"
                    required
                    maxLength={1000}
                    value={borrador.noSePuedeSaber}
                    onChange={(e) => editar("noSePuedeSaber", e.target.value)}
                    className="mt-2 min-h-24"
                  />
                </div>
                {borrador.avisoTexto && (
                  <div className="rounded-md border border-destructive/40 p-4">
                    <label
                      htmlFor="aviso-analisis"
                      className="text-sm font-medium text-destructive"
                    >
                      Aviso de manejo y validación antes de publicar
                    </label>
                    <Textarea
                      id="aviso-analisis"
                      required
                      maxLength={700}
                      value={borrador.avisoTexto}
                      onChange={(e) => editar("avisoTexto", e.target.value)}
                      className="mt-2 min-h-24"
                    />
                  </div>
                )}
              </div>
              <p className="mt-5 border-l-2 border-clay pl-4 text-sm text-muted-foreground">
                Esta ficha es una sugerencia de la IA que debes revisar y editar. Las fotos no
                confirman composición, limpieza, seguridad ni procedencia; verifica el material en
                planta antes de publicarlo.
              </p>
              <Button type="submit" className="mt-6" disabled={!sucio || ocupado !== null}>
                {ocupado === "guardando" ? <LoaderCircle className="animate-spin" /> : <Check />}
                {ocupado === "guardando" ? "Guardando…" : "Guardar cambios"}
              </Button>
            </form>
          ) : (
            <div className="flex h-full min-h-72 flex-col justify-center border-y border-border py-8">
              <Sparkles className="h-7 w-7 text-primary" strokeWidth={1.25} aria-hidden="true" />
              <h2 className="mt-5 text-heading text-primary-deep">Tu ficha aparecerá aquí</h2>
              <p className="mt-3 text-muted-foreground">
                La sugerencia no se publica automáticamente ni reemplaza la revisión humana.
              </p>
            </div>
          )}
        </div>
      </section>

      <div aria-live="polite">
        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive bg-surface p-4 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {mensaje && (
          <p role="status" className="rounded-md bg-mint p-4 text-sm text-primary-deep">
            {mensaje}
          </p>
        )}
      </div>

      <section className="border-t border-border pt-8">
        <h2 className="text-heading text-primary-deep">Tus análisis</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Solo tu empresa puede ver estas fotos y fichas.
        </p>
        {isLoading ? (
          <p className="mt-6 text-muted-foreground">Cargando tus análisis…</p>
        ) : errorHistorial ? (
          <p role="alert" className="mt-6 text-destructive">
            No pudimos cargar tu historial.
          </p>
        ) : historial.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            Todavía no tienes análisis guardados. Tu primera ficha aparecerá aquí.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {historial.map((analisis) => (
              <li key={analisis.id}>
                <button
                  type="button"
                  onClick={() => abrirAnalisis(analisis)}
                  aria-current={actual?.id === analisis.id ? "true" : undefined}
                  className="surface-card w-full overflow-hidden text-left transition-colors hover:border-primary aria-[current=true]:border-primary"
                >
                  {analisis.foto_url ? (
                    <img
                      src={analisis.foto_url}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center bg-pale-mint">
                      <Camera className="h-8 w-8 text-primary" aria-hidden="true" />
                    </div>
                  )}
                  <span className="block p-4">
                    <span className="block font-display text-xl leading-tight text-primary-deep">
                      {analisis.nombre_material}
                    </span>
                    <span className="mt-2 block text-sm text-muted-foreground">
                      {analisis.categoria
                        ? nombreCategoria(analisis.categoria)
                        : "Categoría no identificada"}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {fechaLima(analisis.created_at)} (Lima)
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
