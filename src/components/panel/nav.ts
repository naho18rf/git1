import {
  Camera,
  Flower2,
  Handshake,
  Home,
  Map,
  PackagePlus,
  ShieldCheck,
  Sprout,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type PanelPath =
  | "/panel"
  | "/panel/asistente"
  | "/panel/analizar"
  | "/panel/publicar"
  | "/panel/mercado"
  | "/panel/tratos"
  | "/panel/impacto"
  | "/panel/mapa"
  | "/panel/perfil"
  | "/panel/admin";

export type PanelItem = {
  to: PanelPath;
  label: string;
  descripcion: string;
  icon: LucideIcon;
  disponible: boolean;
};

/** Secciones del área privada. Cambia `disponible` a true cuando cada módulo esté construido. */
export const PANEL_ITEMS: PanelItem[] = [
  { to: "/panel", label: "Inicio", descripcion: "Resumen de tu cuenta", icon: Home, disponible: true },
  {
    to: "/panel/asistente",
    label: "Asistente",
    descripcion: "Resuelve dudas sobre publicar tu merma, el pasaporte y el certificado.",
    icon: Flower2,
    disponible: true,
  },
  {
    to: "/panel/analizar",
    label: "Analizar merma",
    descripcion: "Sube una foto y obtén una ficha sugerida del material.",
    icon: Camera,
    disponible: false,
  },
  {
    to: "/panel/publicar",
    label: "Publicar lote",
    descripcion: "Crea un lote con su pasaporte y código QR.",
    icon: PackagePlus,
    disponible: true,
  },
  {
    to: "/panel/mercado",
    label: "Mercado",
    descripcion: "Explora lotes y contacta por WhatsApp.",
    icon: Store,
    disponible: true,
  },
  {
    to: "/panel/tratos",
    label: "Mis tratos",
    descripcion: "Sigue tus solicitudes, entregas y constancias.",
    icon: Handshake,
    disponible: true,
  },
  {
    to: "/panel/impacto",
    label: "Impacto",
    descripcion: "Tus kg desviados, CO₂e y agua estimados.",
    icon: Sprout,
    disponible: false,
  },
  {
    to: "/panel/mapa",
    label: "Mapa",
    descripcion: "Mapa de simbiosis industrial en Lima y Callao.",
    icon: Map,
    disponible: false,
  },
  {
    to: "/panel/perfil",
    label: "Mi perfil",
    descripcion: "Datos de tu empresa.",
    icon: UserRound,
    disponible: true,
  },
  {
    to: "/panel/admin",
    label: "Admin",
    descripcion: "Gestión de la plataforma.",
    icon: ShieldCheck,
    disponible: true,
  },
];
