import type { ElementType, ReactNode } from "react";

/**
 * Contenedor de sección. Conserva la API anterior (delay incluido) pero ya no anima:
 * el único movimiento del sitio es la entrada de la portada.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  return <Tag className={className}>{children}</Tag>;
}
