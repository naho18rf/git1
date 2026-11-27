/**
 * Datos editables de los textos legales (Términos y Privacidad).
 * Actualiza este archivo cuando cambie quién opera la plataforma o cuando haya un correo oficial.
 */
export const LEGAL = {
  /** Quién opera Remanente hoy. Cámbialo cuando exista una empresa constituida (razón social y RUC). */
  titular:
    "el equipo fundador de Remanente, formado por estudiantes de la Universidad Nacional de Ingeniería, mientras el proyecto no esté constituido como empresa",
  /** Fecha de la última revisión de los textos. */
  actualizado: "26 de noviembre de 2026",
  /** Correo para derechos sobre datos personales. Vacío = se indica la página de Contacto. */
  correoDatos: "",
} as const;
