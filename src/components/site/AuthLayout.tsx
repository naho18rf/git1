import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
  wide = false,
}: {
  /** Se conserva por compatibilidad; ya no se muestra como etiqueta. */
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  wide?: boolean | undefined;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <aside className="hidden bg-deep lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-between p-12">
          <Logo tone="light" />
          <p className="max-w-sm font-display text-title text-deep-foreground">
            Lo que sobra,
            <br />
            <em className="text-rose">vuelve a florecer.</em>
          </p>
        </div>
      </aside>
      <main className="flex min-h-screen flex-col px-5 py-6 md:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className={`mx-auto my-auto w-full ${wide ? "max-w-2xl" : "max-w-md"} py-10`}>
          <h1 className="text-title text-primary-deep">{title}</h1>
          {subtitle && <p className="measure mt-3 text-base text-muted-foreground">{subtitle}</p>}
          <div className="mt-10">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function Field({
  id,
  label,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export const selectClass =
  "select-chevron flex h-12 w-full appearance-none rounded-md border border-input bg-surface pr-10 pl-4 text-base text-foreground transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-[invalid=true]:border-destructive";

/** Mensaje de error de formulario: color destructive, esquina casi recta. */
export const formErrorClass =
  "rounded-md border border-destructive/40 bg-surface px-4 py-3 text-sm text-destructive";
