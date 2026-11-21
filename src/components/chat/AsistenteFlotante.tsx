import { useLocation } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";

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

/** Rutas donde el botón taparía los campos del formulario o no aporta nada. */
const RUTAS_SIN_ASISTENTE = ["/registro", "/auth", "/recuperar", "/reset-password"];

/** Botón flotante del asistente en las páginas públicas (sin iniciar sesión). */
export function AsistenteFlotante() {
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);
  const [pieVisible, setPieVisible] = useState(false);

  // El pie de página tiene enlaces propios: mientras esté a la vista, el botón flotante
  // los taparía, así que se oculta. El pie puede aparecer o reemplazarse después (páginas
  // que esperan datos), por eso se vuelve a buscar cada vez que cambia el DOM.
  useEffect(() => {
    let observador: IntersectionObserver | undefined;
    let observado: Element | null = null;

    const vigilar = (pie: Element) => {
      observador?.disconnect();
      observado = pie;
      observador = new IntersectionObserver(([entrada]) =>
        setPieVisible(Boolean(entrada?.isIntersecting)),
      );
      observador.observe(pie);
    };

    const revisar = () => {
      const pie = document.querySelector("footer");
      if (pie && pie !== observado) {
        vigilar(pie);
      } else if (!pie && observado) {
        observador?.disconnect();
        observado = null;
        setPieVisible(false);
      }
    };

    const mutaciones = new MutationObserver(revisar);
    mutaciones.observe(document.body, { childList: true, subtree: true });
    revisar();

    return () => {
      mutaciones.disconnect();
      observador?.disconnect();
    };
  }, [pathname]);

  // En el panel ya existe el asistente con conversaciones guardadas.
  if (pathname.startsWith("/panel")) return null;

  // En el registro y el ingreso el botón flotante tapa los campos del formulario.
  if (RUTAS_SIN_ASISTENTE.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`))) {
    return null;
  }

  return (
    <>
      {!pieVisible && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir el asistente de Remanente"
          className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 text-sm font-medium text-foreground shadow-paper transition-colors hover:border-primary hover:text-primary md:bottom-8 md:right-8"
        >
          <img src={flor} alt="" width={816} height={816} className="h-9 w-9 object-contain" />
          <span>Pregúntale a Remanente</span>
        </button>
      )}

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
