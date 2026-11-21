import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CLAVES_MATERIALES } from "./materiales";
import {
  MAX_BYTES_FOTO_ANALISIS,
  actualizarFichaSchema,
  fichaMermaSchema,
  firmaImagenValida,
  tipoImagenValido,
} from "./analisis-merma-reglas";

const BUCKET = "analisis-merma";

const INSTRUCCIONES = `Eres un analista visual de materiales para Remanente, una plataforma peruana de economía circular. Examina únicamente lo visible en la fotografía. No inventes composición, peso, dimensiones, limpieza, ausencia de químicos ni procedencia. No certifiques que un material sea seguro, legal o apto para publicarse. Si la imagen no permite identificar el material, indícalo con honestidad, usa categoría null y confianza baja. Sugiere usos solo como posibilidades sujetas a clasificación, limpieza y validación humana. No estimes precios. Responde en español de Perú, con texto concreto y útil para que una empresa revise la ficha.`;

function extensionPara(tipo: string): string {
  if (tipo === "image/png") return "png";
  if (tipo === "image/webp") return "webp";
  return "jpg";
}

export const analizarMerma = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Selecciona una foto para analizar.");
    const foto = data.get("foto");
    if (!(foto instanceof File)) throw new Error("Selecciona una foto para analizar.");
    return foto;
  })
  .handler(async ({ data: foto, context }) => {
    if (!tipoImagenValido(foto.type) || foto.size === 0 || foto.size > MAX_BYTES_FOTO_ANALISIS) {
      throw new Error("Usa una imagen JPG, PNG o WebP de hasta 1.5 MB.");
    }
    const bytes = new Uint8Array(await foto.arrayBuffer());
    if (!firmaImagenValida(bytes.slice(0, 12)))
      throw new Error("El archivo no contiene una imagen válida.");

    const { data: empresa } = await context.supabase
      .from("empresas")
      .select("id")
      .eq("id", context.userId)
      .maybeSingle();
    if (!empresa) throw new Error("Completa primero el registro de tu empresa.");

    const ruta = `${context.userId}/${crypto.randomUUID()}.${extensionPara(foto.type)}`;
    const { error: uploadError } = await context.supabase.storage
      .from(BUCKET)
      .upload(ruta, foto, { contentType: foto.type, upsert: false });
    if (uploadError) throw new Error("No pudimos guardar la foto. Inténtalo de nuevo.");

    try {
      const { generateResponse } = await import("@lovable.dev/ai-gateway");
      const base64 = Buffer.from(bytes).toString("base64");
      const respuesta = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: INSTRUCCIONES,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Analiza esta foto y devuelve solamente la ficha en el formato JSON solicitado.",
              },
              {
                type: "input_image",
                image_url: `data:${foto.type};base64,${base64}`,
                detail: "high",
              },
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
                  anyOf: [{ type: "string", enum: [...CLAVES_MATERIALES] }, { type: "null" }],
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
              },
              required: [
                "nombre_material",
                "categoria",
                "descripcion",
                "condicion",
                "usos_posibles",
                "recomendaciones",
                "confianza",
              ],
            },
          },
        },
      });
      if (respuesta.status !== "completed")
        throw new Error("La respuesta del análisis no está completa.");
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
          ruta_foto: ruta,
          ...ficha,
        })
        .select("*")
        .single();
      if (error) throw new Error("No se pudo guardar el análisis.");
      return { ...guardado, foto_url: null };
    } catch (error) {
      await context.supabase.storage.from(BUCKET).remove([ruta]);
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
        "No pudimos analizar la foto en este momento. Tu selección sigue aquí para que lo intentes de nuevo.",
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
        const { data: signed } = await context.supabase.storage
          .from(BUCKET)
          .createSignedUrl(analisis.ruta_foto, 3600);
        return {
          ...analisis,
          foto_url:
            signed?.signedUrl?.replace(
              process.env["SUPABASE_URL"] ?? "",
              import.meta.env["VITE_SUPABASE_URL"],
            ) ?? null,
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
    if (error || !actualizado)
      throw new Error("No pudimos guardar los cambios. Inténtalo de nuevo.");
    return actualizado;
  });
