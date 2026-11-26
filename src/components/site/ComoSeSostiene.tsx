import { Reveal } from "@/components/site/Reveal";
import { MESES_GRATIS, PLANES } from "@/lib/planes";

const soles = (n: number) => `S/ ${new Intl.NumberFormat("es-PE").format(n)}`;

export function ComoSeSostiene() {
  return (
    <section id="como-se-sostiene" className="scroll-mt-24 bg-pale-mint px-5 py-24 md:px-8 md:py-32" aria-label="Cómo se sostiene Remanente">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-clay">Cómo se sostiene</p>
          <h2 className="mt-4 text-title text-primary-deep md:text-[3.5rem]">Una suscripción simple, por conexiones</h2>
          <p className="measure mt-6 text-base leading-relaxed text-foreground">
            Publicar es gratis. Pagas cuando quieres conectar con otras empresas: una conexión es un trato aceptado, en el
            que se liberan los datos de contacto entre ambas. Los primeros {MESES_GRATIS} meses son gratis y las conexiones
            de cada mes no se acumulan.
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {PLANES.map((p) => (
            <li
              key={p.id}
              className={`surface-card flex flex-col p-7 ${p.destacado ? "ring-2 ring-primary" : ""}`}
            >
              <p className="font-display text-lg text-primary-deep">{p.nombre}</p>
              <p className="mt-3 font-display text-[2.5rem] leading-none font-medium text-primary-deep">
                {p.precioMensual === 0 ? "Gratis" : soles(p.precioMensual)}
                {p.precioMensual > 0 && <span className="text-base font-normal text-muted-foreground"> al mes</span>}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {p.precioAnual ? `o ${soles(p.precioAnual)} al año (2 meses gratis)` : "Sin costo"}
              </p>
              <p className="mt-5 rounded-full bg-rose-pale px-4 py-2 text-sm font-medium text-primary-deep">
                {p.conexiones} {p.conexiones === 1 ? "conexión" : "conexiones"} al mes
                {p.precioMensual > 0 && ` · ${soles(Math.round((p.precioMensual / p.conexiones) * 100) / 100)} c/u`}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-foreground">
                {p.incluye.map((i) => (
                  <li key={i.texto} className="flex flex-wrap items-center gap-2">
                    <span>{i.texto}</span>
                    {i.proximamente && (
                      <span className="rounded-full bg-mint px-2 py-0.5 text-xs text-primary-deep">Próximamente</span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <p className="measure mt-8 text-sm text-muted-foreground">
          Los cobros aún no están activos: los medios de pago se habilitarán después del período gratuito. Hoy Remanente
          opera en Lima y Callao, y la meta es llevarlo a otras regiones industriales del país.
        </p>
      </div>
    </section>
  );
}
