import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Droplets, Handshake, Recycle, Wind } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatoPorcentaje,
  formatNumero,
  impactoPublicoQuery,
  liderazgoFemeninoQuery,
} from "@/lib/impact";
import { FACTORES, FUENTE_FACTORES } from "@/lib/factores-impacto";
import { nombreCategoria } from "@/lib/materiales";

export const Route = createFileRoute("/_authenticated/panel/impacto")({
  head: () => ({ meta: [{ title: "Impacto · Remanente" }] }),
  component: ImpactoPage,
});

const PASOS = [
  { t: "Publicas un lote", d: "Fotografías el residuo y lo publicas con su peso y material." },
  { t: "Otra empresa lo solicita", d: "La empresa interesada lo pide y tú aceptas el trato." },
  { t: "Se confirma la recepción", d: "Quien recibe confirma la entrega y se emite la constancia." },
  { t: "Se suma al impacto", d: "El lote entra en los totales de la plataforma." },
];

function ImpactoPage() {
  const { data, isLoading, isError } = useQuery(impactoPublicoQuery);
  const {
    data: liderazgo,
    isLoading: liderazgoCargando,
    isError: liderazgoError,
  } = useQuery(liderazgoFemeninoQuery);

  const valor = (n: number | undefined) => (isLoading ? "…" : isError ? "—" : formatNumero(n ?? 0));

  const totales = [
    { icon: Recycle, v: data?.kg_desviados, unidad: "kg", label: "desviados del relleno" },
    { icon: Wind, v: data?.co2e_evitado_kg, unidad: "kg CO₂e", label: "evitado (estimado)" },
    { icon: Droplets, v: data?.agua_ahorrada_l, unidad: "litros", label: "de agua ahorrada (estimado)" },
    { icon: Handshake, v: data?.operaciones_completadas, unidad: "", label: "operaciones completadas" },
  ];

  return (
    <div>
      <h1 className="text-title text-primary-deep">Impacto</h1>
      <p className="measure mt-2 text-muted-foreground">
        Mide cuánto material vuelve a la cadena productiva gracias a los tratos completados en Remanente.
      </p>

      <h2 className="mt-10 text-heading text-primary-deep">Totales de la plataforma</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {totales.map((t) => (
          <div key={t.label} className="surface-card p-5">
            <t.icon className="h-4 w-4 text-clay" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-4 font-display text-4xl leading-none font-medium text-primary-deep tabular-nums">
              {valor(t.v)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.unidad && <span className="font-medium text-foreground">{t.unidad} </span>}
              {t.label}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {isError
          ? "No pudimos cargar las cifras en este momento."
          : "Son cifras reales: empiezan en 0 y crecen con cada entrega confirmada."}
      </p>

      <div className="mt-6 surface-card p-5">
        <p className="text-sm text-muted-foreground">% de empresas dirigidas por mujeres</p>
        {liderazgoCargando || liderazgoError || !liderazgo || liderazgo.respondieron === 0 ? (
          <p className="mt-2 text-heading text-primary-deep">
            {liderazgoCargando
              ? "Cargando…"
              : liderazgoError
                ? "No pudimos cargar esta cifra."
                : "Aún sin datos"}
          </p>
        ) : (
          <p className="mt-2 font-display text-4xl leading-none font-medium text-primary-deep tabular-nums">
            {formatoPorcentaje(liderazgo.dirigidas, liderazgo.respondieron)}%
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {liderazgo && !liderazgoCargando && !liderazgoError && liderazgo.respondieron > 0
            ? `Sobre ${formatNumero(liderazgo.respondieron)} ${
                liderazgo.respondieron === 1 ? "empresa que respondió" : "empresas que respondieron"
              } esta pregunta.`
            : "Se calcula solo con las empresas que respondieron esta pregunta."}
        </p>
      </div>

      <div className="mt-12 rounded-lg bg-rose-pale p-6 md:p-8">
        <Badge variant="outline">Ejemplo ilustrativo</Badge>
        <h2 className="mt-4 text-heading text-primary-deep">Así se construye tu impacto</h2>
        <p className="measure mt-2 text-sm text-foreground">
          Esto explica cómo funciona; no son datos reales de ninguna empresa.
        </p>

        <ol className="mt-6 grid gap-4 md:grid-cols-4">
          {PASOS.map((p, i) => (
            <li key={p.t} className="rounded-lg bg-background p-5">
              <span className="font-display text-xl text-gold">0{i + 1}</span>
              <p className="mt-2 font-medium text-primary-deep">{p.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-lg bg-background p-5">
          <p className="text-sm text-muted-foreground">Lote de ejemplo</p>
          <p className="mt-1 font-display text-xl text-primary-deep">100 kg de retazos textiles entregados</p>
          <ul className="mt-4 grid gap-3 text-sm text-foreground md:grid-cols-3">
            <li><span className="font-medium">Kg desviados:</span> 100 kg, el peso declarado del lote.</li>
            <li><span className="font-medium">CO₂e evitado (estimado):</span> 100 kg × factor del material.</li>
            <li><span className="font-medium">Agua ahorrada (estimada):</span> 100 kg × factor del material.</li>
          </ul>
        </div>
      </div>

      <h2 className="mt-12 text-heading text-primary-deep">Cómo se calcula</h2>
      <ul className="measure mt-3 list-disc space-y-2 pl-5 text-sm text-foreground">
        <li>Solo cuentan los lotes con entrega confirmada por la empresa que los recibió.</li>
        <li>El CO₂e y el agua son estimaciones: kg del lote × factor de su material. No son mediciones oficiales.</li>
        <li>Solo los materiales de la tabla tienen factor. El resto suma kg, pero no CO₂e ni agua.</li>
        <li>Cuando el estudio no muestra ahorro de agua para un material, no se suma ahorro (aparece 0).</li>
        <li>Documento emitido por Remanente. No es una certificación ambiental oficial.</li>
      </ul>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <caption className="pb-2 text-left text-muted-foreground">
            Factores por kg de material. Fuente:{" "}
            <a href={FUENTE_FACTORES.url} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4">
              {FUENTE_FACTORES.titulo}
            </a>
            , datos comerciales e industriales.
          </caption>
          <thead className="text-foreground">
            <tr className="border-b border-border">
              <th scope="col" className="py-2 pr-4 font-medium">Material</th>
              <th scope="col" className="py-2 pr-4 font-medium">kg CO₂e por kg</th>
              <th scope="col" className="py-2 pr-4 font-medium">Litros de agua por kg</th>
              <th scope="col" className="py-2 font-medium">Se basa en</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(FACTORES).map(([clave, f]) => (
              <tr key={clave} className="border-b border-border/60">
                <td className="py-2 pr-4">{nombreCategoria(clave)}</td>
                <td className="py-2 pr-4 tabular-nums">{f.co2e.toLocaleString("es-PE")}</td>
                <td className="py-2 pr-4 tabular-nums">{f.agua.toLocaleString("es-PE")}</td>
                <td className="py-2 text-muted-foreground">
                  {f.base}
                  {f.tipo === "aproximado" && " (aproximado)"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button className="mt-8" asChild>
        <Link to="/panel/publicar">
          <Camera strokeWidth={1.5} />
          Publicar mi primer lote
        </Link>
      </Button>
    </div>
  );
}
