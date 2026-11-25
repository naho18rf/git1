export type Coordenadas = { lat: number; lng: number };
export const LIMA_CENTRO: Coordenadas = { lat: -12.0464, lng: -77.0428 };
export const RADIOS = [5, 15, 30, "todos"] as const;
export type Radio = (typeof RADIOS)[number];

const DISTRITOS: Record<string, Coordenadas> = {
  ate: { lat: -12.0267, lng: -76.9183 },
  callao: { lat: -12.0566, lng: -77.1181 },
  "villa el salvador": { lat: -12.2133, lng: -76.9378 },
  "san juan de lurigancho": { lat: -12.0022, lng: -77.0075 },
  "los olivos": { lat: -11.9761, lng: -77.0686 },
  cercado: { lat: -12.0480, lng: -77.0600 },
};

export function coordenadasDistrito(distrito: string): Coordenadas | undefined {
  const clave = distrito.trim().toLocaleLowerCase("es-PE").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return DISTRITOS[clave === "cercado de lima" || clave === "lima" ? "cercado" : clave];
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