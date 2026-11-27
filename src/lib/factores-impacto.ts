/**
 * Factores de impacto por material (por kg desviado).
 * Fuente única: NSW Department of Environment, Climate Change and Water (2010),
 * "Environmental benefits of recycling", Tabla 4, columna C&I (comercial e industrial).
 * https://www.environment.nsw.gov.au/resources/warrlocal/100058-benefits-of-recycling.pdf
 *
 * 1 t CO₂e por tonelada = 1 kg CO₂e por kg. 1 kL por tonelada = 1 L por kg.
 * Excepción: alfombra usa EPA WARM v16 (EE. UU., 2023): 2,40 t CO₂e por short ton = 2,65 kg por kg; sin dato de agua.
 * Excepción: textil usa 3,169 kg CO₂e por kg de ropa reutilizada en vez de incinerada (Comisión Europea, citada en Marinho Reis, Universidade do Minho,
 * https://repositorium.sdum.uminho.pt/handle/1822/91242). Es ropa usada, no retazos industriales; es una aproximación y no tiene dato de agua.
 * Son estimaciones de estudios extranjeros, no mediciones.
 * Los materiales que no figuran aquí no tienen un factor comparable y no suman CO₂e ni agua.
 */
export type FactorMaterial = {
  /** kg de CO₂e evitado por kg de material */
  co2e: number;
  /** litros de agua ahorrada por kg de material (0 si el estudio no muestra ahorro) */
  agua: number;
  /** "directo": el estudio modela ese material. "aproximado": se usa el valor más bajo de la familia. */
  tipo: "directo" | "aproximado";
  /** Material del estudio en que se basa */
  base: string;
};

export const FACTORES: Readonly<Record<string, FactorMaterial>> = {
  carton_papel: { co2e: 0.63, agua: 28.28, tipo: "directo", base: "Cartón y papel de embalaje" },
  madera: { co2e: 1.35, agua: 0, tipo: "directo", base: "Tarimas y embalajes de madera" },
  vidrio_envases: { co2e: 0.62, agua: 2.44, tipo: "directo", base: "Envases de vidrio" },
  metal_limpio: { co2e: 0.44, agua: 0, tipo: "aproximado", base: "Acero (el más bajo de los metales)" },
  plastico_limpio: { co2e: 1.08, agua: 0, tipo: "aproximado", base: "HDPE (el más bajo de los plásticos)" },
  tapas_preformas: { co2e: 1.18, agua: 0, tipo: "aproximado", base: "PET" },
  flejes: { co2e: 1.08, agua: 0, tipo: "aproximado", base: "HDPE (el más bajo de los plásticos)" },
  carretes_conos: { co2e: 0.63, agua: 0, tipo: "aproximado", base: "Cartón (el más bajo entre cartón y madera)" },
  textil: { co2e: 3.17, agua: 0, tipo: "aproximado", base: "Ropa reutilizada vs incinerada, Comisión Europea (sin dato de agua)" },
  alfombra_tapizado: { co2e: 2.65, agua: 0, tipo: "aproximado", base: "Alfombra, EPA WARM v16 (sin dato de agua)" },
};

export const FUENTE_FACTORES = {
  titulo: "NSW DECCW (2010), Environmental benefits of recycling",
  url: "https://www.environment.nsw.gov.au/resources/warrlocal/100058-benefits-of-recycling.pdf",
};

export type FilaImpacto = { categoria: string | null | undefined; kg: number };

export type ResumenImpacto = {
  co2e: number;
  agua: number;
  kgConFactor: number;
  kgSinFactor: number;
};

/** Suma CO₂e y agua. Los kg de materiales sin factor se cuentan aparte y no suman nada. */
export function calcularImpacto(filas: readonly FilaImpacto[]): ResumenImpacto {
  const total: ResumenImpacto = { co2e: 0, agua: 0, kgConFactor: 0, kgSinFactor: 0 };
  for (const f of filas) {
    const kg = Number.isFinite(f.kg) && f.kg > 0 ? f.kg : 0;
    const factor = f.categoria ? FACTORES[f.categoria] : undefined;
    if (!factor) {
      total.kgSinFactor += kg;
      continue;
    }
    total.kgConFactor += kg;
    total.co2e += kg * factor.co2e;
    total.agua += kg * factor.agua;
  }
  return total;
}
