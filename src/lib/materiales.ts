/**
 * Lista de materiales de Remanente: fuente única para el formulario, la validación
 * en servidor y (más adelante) el asistente. Lo que no está aquí no se puede publicar.
 */
export const MATERIALES_PERMITIDOS = [
  { clave: "textil", nombre: "Textil", descripcion: "Retazos de tela, hilos, conos de hilo, recortes de confección." },
  { clave: "merceria", nombre: "Mercería de confección", descripcion: "Botones, cierres, etiquetas, cintas, elásticos." },
  {
    clave: "madera",
    nombre: "Madera",
    descripcion: "Retazos, listones, viruta, pallets sin tratar. Debes poder declarar su procedencia legal.",
  },
  { clave: "carton_papel", nombre: "Cartón y papel", descripcion: "Cajas, tubos, bobinas, recortes, rollos y papel de embalaje." },
  { clave: "carretes_conos", nombre: "Carretes y conos vacíos", descripcion: "De cartón o madera, vacíos." },
  {
    clave: "organicos_secos",
    nombre: "Orgánicos secos y empacados",
    descripcion: "Cascarilla de arroz, aserrín seco, bagazo seco, borra de café seca. Las cáscaras frescas no se permiten.",
  },
  {
    clave: "plastico_limpio",
    nombre: "Plástico limpio e identificado",
    descripcion: "PET, HDPE o PP en recortes o envases que no contuvieron químicos, sin restos.",
  },
  { clave: "tapas_preformas", nombre: "Tapas y preformas plásticas", descripcion: "PET o PP, limpias y clasificadas por tipo." },
  { clave: "flejes", nombre: "Flejes plásticos", descripcion: "Flejes de embalaje." },
  {
    clave: "metal_limpio",
    nombre: "Metal limpio",
    descripcion: "Retazos de aluminio, acero o cobre sin pintura ni residuos, con borde seguro.",
  },
  { clave: "cuero", nombre: "Cuero y similares", descripcion: "Retazos de cuero o cuerina." },
  {
    clave: "jebe_caucho",
    nombre: "Jebe y caucho",
    descripcion: "Solo recortes limpios de producción (planchas, suelas y juntas nuevas, goma EVA), sin aceite, químicos ni pegamento.",
  },
  { clave: "vidrio_envases", nombre: "Vidrio", descripcion: "Solo envases enteros y limpios." },
  {
    clave: "empaques_compuestos",
    nombre: "Empaques compuestos limpios",
    descripcion: "Tipo Tetra Pak, aplanados y sin restos de contenido.",
  },
  {
    clave: "sacos_bigbags",
    nombre: "Sacos y big bags",
    descripcion: "De polipropileno o yute, limpios y sin residuos de lo que contuvieron.",
  },
  {
    clave: "cuerdas_fibras",
    nombre: "Cuerdas y fibras naturales",
    descripcion: "Yute, cabuya, algodón, lana; secas y sin aceite.",
  },
  { clave: "corcho", nombre: "Corcho", descripcion: "Recortes o tapones." },
  { clave: "alfombra_tapizado", nombre: "Alfombra o tapizado textil", descripcion: "Retazos secos y limpios." },
] as const;

export type CategoriaMaterial = (typeof MATERIALES_PERMITIDOS)[number]["clave"];

export const CLAVES_MATERIALES = MATERIALES_PERMITIDOS.map((m) => m.clave) as [
  CategoriaMaterial,
  ...CategoriaMaterial[],
];

export const MATERIALES_NO_PERMITIDOS = [
  { grupo: "Energía y electrónica", detalle: "Pilas, baterías, aparatos eléctricos o electrónicos, focos y fluorescentes." },
  {
    grupo: "Químicos",
    detalle:
      "Aceites usados y grasas, solventes, pinturas, barnices, tintas, pegamentos industriales, aerosoles, envases que contuvieron químicos o agroquímicos.",
  },
  { grupo: "Salud y riesgo biológico", detalle: "Residuos médicos o biocontaminados, medicamentos, jeringas." },
  { grupo: "Peligrosos por naturaleza", detalle: "Asbesto, material radiactivo, inflamables, explosivos." },
  { grupo: "Madera tratada o protegida", detalle: "Madera tratada con químicos o de especies protegidas sin documentos de procedencia." },
  { grupo: "Orgánicos frescos", detalle: "Orgánicos frescos o en descomposición, con plagas; carne y restos animales." },
  { grupo: "Neumáticos", detalle: "Neumáticos y caucho vulcanizado usado." },
  { grupo: "Vidrio roto", detalle: "Cualquier vidrio roto." },
  { grupo: "Espumas y polvos", detalle: "Espumas de poliuretano y polvos finos en grandes volúmenes." },
  { grupo: "Lotes sin clasificar", detalle: "Lotes mezclados sin clasificar, o cuyo contenido no se pueda identificar en la foto." },
  { grupo: "Cables y metal dudoso", detalle: "Cables de cobre o metal de procedencia dudosa." },
] as const;

export const NOTA_LISTA_MATERIALES =
  "Esta lista es una guía de Remanente, no una norma legal. Algunos materiales tienen reglas propias en Perú.";

export function esCategoriaValida(valor: unknown): valor is CategoriaMaterial {
  return typeof valor === "string" && (CLAVES_MATERIALES as readonly string[]).includes(valor);
}

export function nombreCategoria(clave: string): string {
  return MATERIALES_PERMITIDOS.find((m) => m.clave === clave)?.nombre ?? "Material";
}
