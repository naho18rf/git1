import type { ReactNode } from "react";

import { PageShell } from "./PageShell";

export function SimplePage({
  title,
  intro,
  children,
}: {
  /** Se conserva por compatibilidad; ya no se muestra como etiqueta. */
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <h1 className="text-title text-primary-deep md:text-display">{title}</h1>
        {intro && <div className="measure mt-6 text-lead text-muted-foreground">{intro}</div>}
        <div className="measure mt-12 space-y-10 text-base leading-relaxed text-foreground [&_h2]:font-display [&_h2]:text-heading [&_h2]:text-primary-deep [&_p]:mt-3 [&_p]:text-muted-foreground [&_section]:border-t [&_section]:border-border [&_section]:pt-8">
          {children}
        </div>
      </article>
    </PageShell>
  );
}

export function DraftNotice() {
  return (
    <p className="rounded-md bg-rose-pale px-5 py-4 text-sm text-foreground">
      Borrador inicial. Este texto debe ser revisado por asesoría legal antes del lanzamiento.
    </p>
  );
}
