/** Planes de Remanente. Cambia los precios aquí y se actualizan en toda la web. */
export type Plan = {
  id: "gratis" | "basico" | "premium";
  nombre: string;
  precioMensual: number;
  precioAnual: number | null;
  conexiones: number;
  destacado?: boolean;
  incluye: { texto: string; proximamente?: boolean }[];
};

export const MESES_GRATIS = 2;

export const PLANES: Plan[] = [
  {
    id: "gratis",
    nombre: "Gratis",
    precioMensual: 0,
    precioAnual: null,
    conexiones: 1,
    incluye: [{ texto: "Publicar lotes" }, { texto: "Ficha del material con IA" }, { texto: "Pasaporte con QR y constancia" }],
  },
  {
    id: "basico",
    nombre: "Básico",
    precioMensual: 40,
    precioAnual: 400,
    conexiones: 4,
    incluye: [{ texto: "Todo lo del plan Gratis" }, { texto: "4 conexiones al mes" }, { texto: "Mapa de empresas cercanas" }],
  },
  {
    id: "premium",
    nombre: "Premium",
    precioMensual: 90,
    precioAnual: 900,
    conexiones: 12,
    destacado: true,
    incluye: [
      { texto: "Todo lo del plan Básico" },
      { texto: "12 conexiones al mes" },
      { texto: "Alertas cuando se publique un lote que te sirva", proximamente: true },
      { texto: "Tus lotes aparecen primero en el mercado", proximamente: true },
      { texto: "Reporte de impacto en PDF", proximamente: true },
    ],
  },
];
