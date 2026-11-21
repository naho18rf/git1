import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string | undefined }) {
  return (
    <Sprout
      className={cn("h-5 w-5 shrink-0 text-primary", className)}
      strokeWidth={1.5}
      aria-hidden="true"
    />
  );
}

export function Logo({ to = "/", tone = "default" }: { to?: "/" | "/panel"; tone?: "default" | "light" }) {
  return (
    <Link
      to={to}
      className="group inline-flex min-h-11 items-center gap-2.5 rounded-sm"
      aria-label="Remanente, inicio"
    >
      <span className={cn(
        "grid h-9 w-9 place-items-center rounded-full",
        tone === "light" ? "bg-deep-foreground/10" : "bg-mint",
      )}>
        <LogoMark className={tone === "light" ? "text-mint" : undefined} />
      </span>
      <span
        className={cn(
          "font-display text-[26px] leading-none font-medium tracking-[-0.02em]",
          tone === "light" ? "text-deep-foreground" : "text-primary-deep",
        )}
      >
        Remanente
      </span>
    </Link>
  );
}
