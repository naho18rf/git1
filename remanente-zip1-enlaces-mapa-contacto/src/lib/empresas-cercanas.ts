export type Coordenadas = { lat: number; lng: number };
export const LIMA_CENTRO: Coordenadas = { lat: -12.0464, lng: -77.0428 };
export const RADIOS = [5, 15, 30, "todos"] as const;
export type Radio = (typeof RADIOS)[number];

/**
 * Referencias aproximadas por distrito (punto central, no la dirección de la sede).
 * Cubre los 43 distritos de Lima Metropolitana y los 7 del Callao que ofrece el registro.
 * Las primeras seis entradas son las originales del proyecto; las demás son centroides
 * aproximados: verifícalos antes de usarlos para algo más que una referencia visual.
 */
const DISTRITOS: Record<string, Coordenadas> = {
  // Originales del proyecto (no cambiar: las pruebas las fijan)
  ate: { lat: -12.0267, lng: -76.9183 },
  callao: { lat: -12.0566, lng: -77.1181 },
  "villa el salvador": { lat: -12.2133, lng: -76.9378 },
  "san juan de lurigancho": { lat: -12.0022, lng: -77.0075 },
  "los olivos": { lat: -11.9761, lng: -77.0686 },
  cercado: { lat: -12.048, lng: -77.06 },
  // Lima Metropolitana
  ancon: { lat: -11.7739, lng: -77.1744 },
  barranco: { lat: -12.1403, lng: -77.0206 },
  brena: { lat: -12.0586, lng: -77.0508 },
  carabayllo: { lat: -11.8947, lng: -77.0372 },
  chaclacayo: { lat: -11.9753, lng: -76.7681 },
  chorrillos: { lat: -12.1676, lng: -77.0183 },
  cieneguilla: { lat: -12.0897, lng: -76.7761 },
  comas: { lat: -11.9411, lng: -77.0589 },
  "el agustino": { lat: -12.0394, lng: -77.0094 },
  independencia: { lat: -11.9917, lng: -77.0539 },
  "jesus maria": { lat: -12.0711, lng: -77.0514 },
  "la molina": { lat: -12.0803, lng: -76.9139 },
  "la victoria": { lat: -12.0658, lng: -77.0147 },
  lince: { lat: -12.0842, lng: -77.0344 },
  "lurigancho-chosica": { lat: -11.9411, lng: -76.6992 },
  lurin: { lat: -12.2753, lng: -76.8706 },
  "magdalena del mar": { lat: -12.0894, lng: -77.0728 },
  miraflores: { lat: -12.1219, lng: -77.0297 },
  pachacamac: { lat: -12.23, lng: -76.86 },
  pucusana: { lat: -12.4803, lng: -76.7967 },
  "pueblo libre": { lat: -12.0733, lng: -77.0636 },
  "puente piedra": { lat: -11.8572, lng: -77.0753 },
  "punta hermosa": { lat: -12.3367, lng: -76.8208 },
  "punta negra": { lat: -12.3639, lng: -76.7928 },
  rimac: { lat: -12.0289, lng: -77.0436 },
  "san bartolo": { lat: -12.3894, lng: -76.7803 },
  "san borja": { lat: -12.1039, lng: -77.0 },
  "san isidro": { lat: -12.0978, lng: -77.0369 },
  "san juan de miraflores": { lat: -12.1544, lng: -76.9714 },
  "san luis": { lat: -12.0775, lng: -76.9961 },
  "san martin de porres": { lat: -12.0, lng: -77.0833 },
  "san miguel": { lat: -12.0789, lng: -77.0825 },
  "santa anita": { lat: -12.0436, lng: -76.9703 },
  "santa maria del mar": { lat: -12.3994, lng: -76.7747 },
  "santa rosa": { lat: -11.8044, lng: -77.1714 },
  "santiago de surco": { lat: -12.1453, lng: -76.9917 },
  surquillo: { lat: -12.1111, lng: -77.0136 },
  "villa maria del triunfo": { lat: -12.1633, lng: -76.9347 },
  // Provincia Constitucional del Callao (además de "callao")
  bellavista: { lat: -12.0589, lng: -77.1264 },
  "carmen de la legua-reynoso": { lat: -12.0425, lng: -77.0928 },
  "la perla": { lat: -12.0703, lng: -77.1169 },
  "la punta": { lat: -12.0722, lng: -77.1647 },
  "mi peru": { lat: -11.8578, lng: -77.1189 },
  ventanilla: { lat: -11.875, lng: -77.125 },
};

/** Nombres con los que el registro o los usuarios pueden escribir un distrito. */
const ALIAS: Record<string, string> = {
  "cercado de lima": "cercado",
  "lima (cercado)": "cercado",
  lima: "cercado",
};

export function coordenadasDistrito(distrito: string): Coordenadas | undefined {
  const clave = distrito.trim().toLocaleLowerCase("es-PE").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return DISTRITOS[ALIAS[clave] ?? clave];
}

export function distanciaKm(origen: Coordenadas, destino: Coordenadas): number {
  const rad = (grados: number) => grados * Math.PI / 180;
  const a = Math.sin(rad(destino.lat - origen.lat) / 2) ** 2
    + Math.cos(rad(origen.lat)) * Math.cos(rad(destino.lat))
    * Math.sin(rad(destino.lng - origen.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
}

export type LoteUbicable = { empresa_id: string; nombre_empresa: string; distrito: string; categoria: string };
export type EmpresaCercana = {
  id: string; nombre: string; distrito: string; coordenadas: Coordenadas; categorias: string[]; distancia: number;
};

export function empresasCercanas(lotes: readonly LoteUbicable[], origen: Coordenadas, radio: Radio): EmpresaCercana[] {
  const empresas = new Map<string, EmpresaCercana>();
  for (const lote of lotes) {
    const coordenadas = coordenadasDistrito(lote.distrito);
    if (!coordenadas) continue;
    const id = `${lote.empresa_id}:${lote.distrito}`;
    const previa = empresas.get(id);
    if (previa) {
      if (!previa.categorias.includes(lote.categoria)) previa.categorias.push(lote.categoria);
    } else {
      empresas.set(id, { id, nombre: lote.nombre_empresa, distrito: lote.distrito, coordenadas,
        categorias: [lote.categoria], distancia: distanciaKm(origen, coordenadas) });
    }
  }
  return [...empresas.values()].filter((empresa) => radio === "todos" || empresa.distancia <= radio)
    .sort((a, b) => a.distancia - b.distancia || a.nombre.localeCompare(b.nombre, "es-PE"));
}

export function enlacesMapa({ lat, lng }: Coordenadas) {
  return {
    mapa: `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
    indicaciones: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  };
}
export type CandidataLote = { nombre_empresa: string; distrito: string; ya_solicito: boolean };

/** Hasta 5 empresas: mismo distrito primero, luego las que ya solicitaron la categoría, luego por cercanía. */
export function empresasSugeridas(candidatas: readonly CandidataLote[], distritoLote: string, max = 5) {
  const norm = (d: string) => d.trim().toLocaleLowerCase("es-PE");
  const origen = coordenadasDistrito(distritoLote);
  const dist = (d: string) => {
    if (norm(d) === norm(distritoLote)) return 0;
    const c = coordenadasDistrito(d);
    return origen && c ? distanciaKm(origen, c) : Number.POSITIVE_INFINITY;
  };
  return [...candidatas]
    .map((c) => ({ ...c, mismo: norm(c.distrito) === norm(distritoLote), km: dist(c.distrito) }))
    .sort((a, b) => Number(b.mismo) - Number(a.mismo) || Number(b.ya_solicito) - Number(a.ya_solicito)
      || a.km - b.km || a.nombre_empresa.localeCompare(b.nombre_empresa, "es-PE"))
    .slice(0, max)
    .map(({ nombre_empresa, distrito }) => ({ nombre_empresa, distrito }));
}
