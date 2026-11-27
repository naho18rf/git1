import {
  Flower2,
  Handshake,
  Home,
  MapPin,
  PackagePlus,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
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
  | "/panel/mapa"
  | "/panel/tratos"
  | "/panel/impacto"
  | "/panel/premium"
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
  {
    to: "/panel",
    label: "Inicio",
    descripcion: "Resumen de tu cuenta",
    icon: Home,
    disponible: true,
  },
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
    descripcion:
      "Sube fotos de tu merma y la IA propone una ficha editable, con usos posibles en Lima y Callao.",
    icon: Sparkles,
    disponible: true,
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
    to: "/panel/mapa",
    label: "Mapa",
    descripcion: "Empresas con lotes publicados, por distrito y distancia.",
    icon: MapPin,
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
    disponible: true,
  },
  {
    to: "/panel/premium",
    label: "Premium",
    descripcion: "Alertas de lotes y reporte de impacto en PDF.",
    icon: Star,
    disponible: true,
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
