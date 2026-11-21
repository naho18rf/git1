import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth, useSignOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { hash: "como-funciona", label: "Cómo funciona" },
  { hash: "impacto", label: "Impacto" },
] as const;

export function SiteHeader() {
  const { session, ready } = useAuth();
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);

  const actions = !ready ? (
    <span className="h-11 w-24" aria-hidden="true" />
  ) : session ? (
    <>
      <Button variant="ghost" onClick={signOut}>Salir</Button>
      <Button asChild><Link to="/panel">Mi panel</Link></Button>
    </>
  ) : (
    <Button variant="ghost" asChild><Link to="/auth">Ingresar</Link></Button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {NAV.map((n) => (
            <Link
              key={n.hash}
              to="/"
              hash={n.hash}
              className="inline-flex min-h-11 items-center rounded-sm text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/mercado"
            className="inline-flex min-h-11 items-center rounded-sm text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Mercado
          </Link>
          <Link
            to="/contacto"
            className="inline-flex min-h-11 items-center rounded-sm text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Contacto
          </Link>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">{actions}</div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-primary hover:text-primary lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </div>
      <div className={cn(
        "overflow-hidden border-t border-border bg-background lg:hidden",
        open ? "max-h-[28rem]" : "max-h-0 border-t-0",
      )}>
        <nav className="flex flex-col px-5 py-3" aria-label="Principal móvil">
          {NAV.map((n) => (
            <Link
              key={n.hash}
              to="/"
              hash={n.hash}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center border-b border-border text-base text-foreground transition-colors last-of-type:border-b-0 hover:text-primary"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/mercado"
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center border-b border-border text-base text-foreground transition-colors hover:text-primary"
          >
            Mercado
          </Link>
          <Link
            to="/contacto"
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center border-b border-border text-base text-foreground transition-colors hover:text-primary"
          >
            Contacto
          </Link>
          <div className="mt-4 flex flex-col gap-2 pb-2 [&>*]:w-full">{actions}</div>
        </nav>
      </div>
    </header>
  );
}
