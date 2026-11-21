import { useLocation } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";

import flor from "@/assets/asistente-flor.png";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// El chat se descarga solo al abrirlo, para no hacer más pesada la portada.
const ChatPublico = lazy(() => import("./ChatPublico"));

/** Botón flotante del asistente en las páginas públicas (sin iniciar sesión). */
export function AsistenteFlotante() {
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);

  // En el panel ya existe el asistente con conversaciones guardadas.
  if (pathname.startsWith("/panel")) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir el asistente de Remanente"
        className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 text-sm font-medium text-foreground shadow-paper transition-colors hover:border-primary hover:text-primary md:bottom-8 md:right-8"
      >
        <img src={flor} alt="" width={816} height={816} className="h-9 w-9 object-contain" />
        <span>Pregúntale a Remanente</span>
      </button>

      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-5 sm:max-w-md">
          <SheetHeader className="mb-3 space-y-1 p-0 pr-8 text-left">
            <SheetTitle className="flex items-center gap-2 font-display text-xl">
              <img src={flor} alt="" width={816} height={816} className="h-8 w-8 object-contain" />
              Asistente de Remanente
            </SheetTitle>
            <SheetDescription>
              Asistente automático: puede equivocarse. Para acuerdos o pagos, escríbenos desde
              Contacto.
            </SheetDescription>
          </SheetHeader>
          {abierto && (
            <Suspense
              fallback={
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Abriendo el asistente…
                </p>
              }
            >
              <ChatPublico />
            </Suspense>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
