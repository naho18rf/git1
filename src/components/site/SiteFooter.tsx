import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Economía circular entre empresas de Lima y Callao.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-7 text-sm" aria-label="Legal">
          <Link to="/terminos" className="inline-flex min-h-11 items-center rounded-sm text-muted-foreground transition-colors hover:text-primary">
            Términos y condiciones
          </Link>
          <Link to="/privacidad" className="inline-flex min-h-11 items-center rounded-sm text-muted-foreground transition-colors hover:text-primary">
            Privacidad
          </Link>
          <Link to="/contacto" className="inline-flex min-h-11 items-center rounded-sm text-muted-foreground transition-colors hover:text-primary">
            Contacto
          </Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-5 py-5 text-[13px] text-muted-foreground md:px-8">
          © {new Date().getFullYear()} Remanente · Lima, Perú
        </p>
      </div>
    </footer>
  );
}
