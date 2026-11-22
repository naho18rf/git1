import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MATERIALES_PERMITIDOS } from "./materiales";
import {
  MAX_BYTES_FOTO_ANALISIS,
  actualizarFichaSchema,
  cantidadFotosValida,
  fichaMermaSchema,
  firmaImagenValida,
  rutasFotosSchema,
  tipoImagenValido,
} from "./analisis-merma-reglas";

const BUCKET = "analisis-merma";
const CATEGORIAS = MATERIALES_PERMITIDOS.map(
  (material) => `- ${material.clave}: ${material.nombre}. ${material.descripcion}`,
).join("\n");

const INSTRUCCIONES = `Eres un analista visual de residuos y excedentes para Remanente, una plataforma peruana de economía circular. Analiza conjuntamente todas las fotos: corresponden al mismo residuo. Examina únicamente lo visible y responde en español de Perú, con trato de "tú" y texto concreto para que una empresa revise y edite la ficha.

Devuelve siempre todos los campos del esquema JSON:
- nombre_material: material visible o "No se puede identificar el material en las fotos".
- categoria: usa solamente una de las claves permitidas de la lista de abajo, para que coincida con Publicar lote. Si no hay suficiente evidencia para elegir una, devuelve null; no inventes una categoría.
- descripcion: describe solo características visibles, sin atribuir composición, procedencia, limpieza o dimensiones no demostrables.
- condicion: estado visible del material. Si no puede evaluarse, indícalo.
- usos_posibles: hasta 5 usos concretos y plausibles para empresas de Lima y Callao, por ejemplo confección, carpintería, embalaje, manufactura o reciclaje. No afirmes que existe un comprador ni que el material es apto sin procesamiento. Devuelve una lista vacía si no puedes identificarlo o si requiere gestión especializada.
- recomendaciones: manejo, separación, limpieza cuando corresponda y almacenamiento seguro, sin certificar seguridad.
- confianza: alta solo si el material y su estado se distinguen claramente; media si hay dudas parciales; baja si la identificación es incierta o no es posible.
- no_se_puede_saber: incluye siempre que las fotos no confirman composición exacta, contaminación, peso ni peligrosidad; añade otras limitaciones relevantes.
- aviso_manejo: si parece haber aceites, químicos, residuos eléctricos o electrónicos, envases con restos u otro residuo delicado, incluye un aviso visible de manejo especializado y validación antes de publicar. Nunca afirmes que es seguro. Si no hay indicios, devuelve null.

Si las fotos son borrosas, oscuras, están muy lejos o no muestran suficiente material, no adivines: dilo claramente en nombre_material, descripcion y condicion; usa categoria null, confianza baja y usos_posibles vacíos; en recomendaciones pide otra foto nítida, con buena luz y desde ángulos que muestren el material. No rellenes los demás campos con suposiciones.

Nunca estimes precio, valor comercial ni peso, y no des cifras de dimensiones o cantidad. No certifiques que un residuo es seguro, legal, limpio o apto para publicarse. Las sugerencias nunca reemplazan la inspección y validación humana.

Claves y criterios de categoría permitidos:
${CATEGORIAS}`;

function extensionPara(tipo: string): string {
  if (tipo === "image/png") return "png";
  if (tipo === "image/webp") return "webp";
  return "jpg";
}

export const analizarMerma = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Selecciona entre 1 y 3 fotos para analizar.");
    const valores = data.getAll("fotos");
    const fotos = valores.filter((valor): valor is File => valor instanceof File);
    if (!cantidadFotosValida(fotos.length) || fotos.length !== valores.length) {
      throw new Error("Selecciona entre 1 y 3 fotos del mismo residuo.");
    }
    return fotos;
  })
  .handler(async ({ data: fotos, context }) => {
    for (const foto of fotos) {
      if (!tipoImagenValido(foto.type) || foto.size === 0 || foto.size > MAX_BYTES_FOTO_ANALISIS) {
        throw new Error("Usa imágenes JPG, PNG o WebP de hasta 1.5 MB cada una.");
      }
    }

    const { data: empresa } = await context.supabase
      .from("empresas")
      .select("id")
      .eq("id", context.userId)
      .maybeSingle();
    if (!empresa) throw new Error("Completa primero el registro de tu empresa.");

    const preparadas = await Promise.all(
      fotos.map(async (foto) => {
        const bytes = new Uint8Array(await foto.arrayBuffer());
        if (!firmaImagenValida(bytes.slice(0, 12))) {
          throw new Error("Uno de los archivos no contiene una imagen válida.");
        }
        return {
          foto,
          bytes,
          ruta: `${context.userId}/${crypto.randomUUID()}.${extensionPara(foto.type)}`,
        };
      }),
    );
    const rutas = preparadas.map((preparada) => preparada.ruta);

    try {
      for (const preparada of preparadas) {
        const { error: uploadError } = await context.supabase.storage
          .from(BUCKET)
          .upload(preparada.ruta, preparada.foto, {
            contentType: preparada.foto.type,
            upsert: false,
          });
        if (uploadError) throw new Error("No pudimos guardar las fotos. Inténtalo de nuevo.");
      }

      const { generateResponse } = await import("@lovable.dev/ai-gateway");
      const respuesta = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: INSTRUCCIONES,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Analiza conjuntamente estas ${fotos.length} fotos del mismo residuo y devuelve solamente la ficha en el formato JSON solicitado.`,
              },
              ...preparadas.map((preparada) => ({
                type: "input_image" as const,
                image_url: `data:${preparada.foto.type};base64,${Buffer.from(preparada.bytes).toString("base64")}`,
                detail: "high" as const,
              })),
            ],
          },
        ],
        reasoning: { effort: "low" },
        max_output_tokens: 2500,
        text: {
          format: {
            type: "json_schema",
            name: "ficha_merma",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                nombre_material: { type: "string", maxLength: 120 },
                categoria: {
                  anyOf: [
                    {
                      type: "string",
                      enum: MATERIALES_PERMITIDOS.map((material) => material.clave),
                    },
                    { type: "null" },
                  ],
                },
                descripcion: { type: "string", maxLength: 1000 },
                condicion: { type: "string", maxLength: 500 },
                usos_posibles: {
                  type: "array",
                  maxItems: 5,
                  items: { type: "string", maxLength: 160 },
                },
                recomendaciones: { type: "string", maxLength: 1000 },
                confianza: { type: "string", enum: ["alta", "media", "baja"] },
                no_se_puede_saber: { type: "string", maxLength: 1000 },
                aviso_manejo: {
                  anyOf: [{ type: "string", maxLength: 700 }, { type: "null" }],
                },
              },
              required: [
                "nombre_material",
                "categoria",
                "descripcion",
                "condicion",
                "usos_posibles",
                "recomendaciones",
                "confianza",
                "no_se_puede_saber",
                "aviso_manejo",
              ],
            },
          },
        },
      });
      if (respuesta.status !== "completed") {
        throw new Error("La respuesta del análisis no está completa.");
      }
      const texto = respuesta.output
        .flatMap((item) =>
          item.type === "message"
            ? item.content.flatMap((part) => (part.type === "output_text" ? [part.text] : []))
            : [],
        )
        .join("\n");
      const ficha = fichaMermaSchema.parse(JSON.parse(texto));
      const { data: guardado, error } = await context.supabase
        .from("analisis_merma")
        .insert({
          empresa_id: context.userId,
          ruta_foto: preparadas[0]!.ruta,
          rutas_fotos: rutas,
          ...ficha,
        })
        .select("*")
        .single();
      if (error) throw new Error("No se pudo guardar el análisis.");
      return { ...guardado, foto_url: null, fotos_urls: [] };
    } catch (error) {
      await context.supabase.storage.from(BUCKET).remove(rutas);
      const { GatewayError } = await import("@lovable.dev/ai-gateway");
      if (error instanceof GatewayError) {
        console.error("[analisis-merma] Error del modelo", {
          code: error.code,
          httpStatus: error.httpStatus,
          outcome: error.outcome,
        });
      } else {
        console.error(
          "[analisis-merma] No se pudo completar el análisis",
          error instanceof Error ? error.message : "Error desconocido",
        );
      }
      throw new Error(
        "No pudimos analizar las fotos en este momento. Tu selección sigue aquí para que lo intentes de nuevo.",
      );
    }
  });

export const listarAnalisisMerma = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("analisis_merma")
      .select("*")
      .eq("empresa_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw new Error("No pudimos cargar tus análisis.");
    return Promise.all(
      data.map(async (analisis) => {
        const rutas = rutasFotosSchema.parse(analisis.rutas_fotos);
        const urls = await Promise.all(
          rutas.map(async (ruta) => {
            const { data: signed } = await context.supabase.storage
              .from(BUCKET)
              .createSignedUrl(ruta, 3600);
            return (
              signed?.signedUrl?.replace(
                process.env["SUPABASE_URL"] ?? "",
                import.meta.env["VITE_SUPABASE_URL"],
              ) ?? null
            );
          }),
        );
        return {
          ...analisis,
          foto_url: urls[0] ?? null,
          fotos_urls: urls.filter((url): url is string => url !== null),
        };
      }),
    );
  });

export const actualizarFichaMerma = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => actualizarFichaSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { id, ...ficha } = data;
    const { data: actualizado, error } = await context.supabase
      .from("analisis_merma")
      .update(ficha)
      .eq("id", id)
      .eq("empresa_id", context.userId)
      .select("*")
      .maybeSingle();
    if (error || !actualizado) {
      throw new Error("No pudimos guardar los cambios. Inténtalo de nuevo.");
    }
    return actualizado;
  });
