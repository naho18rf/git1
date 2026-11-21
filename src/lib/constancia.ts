/**
 * Reglas compartidas de la constancia de entrega. La constancia se emite y se
 * verifica en la base de datos (`transicion_trato`, `hash_constancia`,
 * `verificar_constancia`); aquí viven el formato del número, los campos que
 * puede ver cualquiera y una réplica de la huella para comprobarla de forma independiente.
 */

/** Formato del número: CE-AAAA-XXXXXX (sin 0, 1, I ni O para evitar confusiones). */
export const NUMERO_CONSTANCIA_RE = /^CE-\d{4}-[A-HJ-NP-Z2-9]{6}$/i;

export function esNumeroConstancia(numero: string) {
  return NUMERO_CONSTANCIA_RE.test(numero.trim());
}

/** Lo único que la verificación pública muestra. Nunca RUC, correos, teléfonos ni representantes. */
export const CAMPOS_VERIFICACION_PUBLICA = ["numero", "emitida_at", "vendedora", "compradora", "categoria", "peso_kg", "hash_valido"] as const;

export type VerificacionPublica = {
  numero: string;
  emitida_at: string;
  vendedora: string | null;
  compradora: string | null;
  categoria: string | null;
  peso_kg: number | null;
  hash_valido: boolean;
};

/** Copia solo los campos públicos, aunque la fila traiga más datos. */
export function aVerificacionPublica(fila: Record<string, unknown>): VerificacionPublica {
  const texto = (v: unknown) => (typeof v === "string" ? v : null);
  return {
    numero: String(fila["numero"] ?? ""),
    emitida_at: String(fila["emitida_at"] ?? ""),
    vendedora: texto(fila["vendedora"]),
    compradora: texto(fila["compradora"]),
    categoria: texto(fila["categoria"]),
    peso_kg: fila["peso_kg"] == null ? null : Number(fila["peso_kg"]),
    hash_valido: fila["hash_valido"] === true,
  };
}

type Json = string | number | boolean | null | Json[] | { [k: string]: Json | undefined };

const enc = new TextEncoder();
function compararBytes(a: string, b: string) {
  const x = enc.encode(a), y = enc.encode(b);
  if (x.length !== y.length) return x.length - y.length; // jsonb ordena primero por longitud
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
}

/** Texto con el que la base de datos serializa un jsonb (claves por longitud y luego por bytes, separadores ", " y ": "). */
export function textoJsonb(v: Json): string {
  if (v === null) return "null";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.map(textoJsonb).join(", ")}]`;
  const claves = Object.keys(v).filter((k) => v[k] !== undefined).sort(compararBytes);
  return `{${claves.map((k) => `${JSON.stringify(k)}: ${textoJsonb(v[k] as Json)}`).join(", ")}}`;
}

/** Fecha en UTC con microsegundos, igual que `hash_constancia`. Acepta el formato que devuelve la base de datos. */
export function fechaHuella(emitida: string) {
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}(?::?\d{2})?)$/.exec(emitida.trim());
  if (!m) throw new Error("Fecha de emisión no válida.");
  const [, dia, hora, frac = "", zona = "Z"] = m;
  const offset = zona === "Z" ? "Z" : zona.length === 3 ? `${zona}:00` : zona.includes(":") ? zona : `${zona.slice(0, 3)}:${zona.slice(3)}`;
  const iso = new Date(`${dia}T${hora}${offset}`).toISOString();
  return `${iso.slice(0, 19)}.${frac.padEnd(6, "0")}Z`;
}

/** Recalcula la huella SHA-256 de una constancia: sha256(snapshot + "|" + fecha UTC). */
export async function huellaConstancia(snapshot: Json, emitida: string) {
  const datos = enc.encode(`${textoJsonb(snapshot)}|${fechaHuella(emitida)}`);
  const digest = await crypto.subtle.digest("SHA-256", datos);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
