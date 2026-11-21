import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Camera,
  Droplets,
  FileCheck2,
  Handshake,
  PackageOpen,
  QrCode,
  Recycle,
  Wind,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroFlow } from "@/components/site/HeroFlow";
import { PageShell } from "@/components/site/PageShell";
import { PasosInteractivos } from "@/components/site/PasosInteractivos";
import { Reveal } from "@/components/site/Reveal";
import { formatNumero, impactoPublicoQuery } from "@/lib/impact";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Remanente · Lo que sobra, vuelve a florecer" },
      {
        name: "description",
        content:
          "Plataforma B2B de economía circular en Lima y Callao: publica tu merma industrial y conecta con empresas que la usan como materia prima.",
      },
      { property: "og:title", content: "Remanente · Lo que sobra, vuelve a florecer" },
      {
        property: "og:description",
        content:
          "Conecta residuos industriales con empresas que los reutilizan como materia prima en Lima y Callao.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <PageShell>
      <Hero />
      <Pasos />
      <Impacto />
      <Mercado />
      <Pasaporte />
    </PageShell>
  );
}

function Hero() {
  const indicadores = [
    { hash: "como-funciona", label: "Cómo funciona", activo: true },
    { hash: "pasaporte", label: "Pasaporte y certificado", activo: false },
    { hash: "impacto", label: "Impacto", activo: false },
  ];

  return (
    <section className="hero-surface relative min-h-[680px] overflow-hidden md:min-h-[620px]">
      <div className="absolute inset-0 translate-x-16 opacity-45 md:translate-x-0 md:opacity-100">
        <HeroFlow />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl items-center px-5 pt-16 pb-44 md:min-h-[620px] md:px-8 md:pt-20 md:pb-36">
        <div className="max-w-[380px] border-l-2 border-rose pl-5">
          <h1 className="text-[clamp(2.5rem,6vw,3.5rem)] leading-[1.02] font-medium text-ivory">
            <span className="block animate-rise">Lo que sobra,</span>
            <span className="block animate-rise [animation-delay:140ms]">vuelve a</span>
            <em className="block animate-rise font-medium text-rose [animation-delay:280ms]">florecer.</em>
          </h1>
          <p className="mt-6 animate-rise text-[15px] leading-relaxed text-deep-muted [animation-delay:380ms]">
            Remanente conecta a las empresas que generan residuos industriales con aquellas que
            pueden usarlos como materia prima. Menos relleno sanitario, más valor compartido.
          </p>
          <Button
            size="lg"
            variant="rose"
            className="mt-8 w-full animate-rise px-6 [animation-delay:480ms] sm:w-auto"
            asChild
          >
            <Link to="/registro">
              <Camera strokeWidth={1.5} />
              Sube una foto de tu merma
            </Link>
          </Button>
        </div>
      </div>
      <nav
        className="absolute inset-x-0 bottom-0 z-10 mx-auto grid max-w-7xl grid-cols-3 gap-3 px-5 pb-5 md:gap-8 md:px-8 md:pb-6"
        aria-label="Secciones de la portada"
      >
        {indicadores.map((item) => (
          <Link
            key={item.hash}
            to="/"
            hash={item.hash}
            aria-current={item.activo ? "location" : undefined}
            className="flex min-h-11 flex-col justify-end text-[11px] leading-snug text-deep-muted transition-colors hover:text-ivory sm:text-[13px]"
          >
            <span className={`mb-3 block h-[3px] w-full ${item.activo ? "bg-rose" : "bg-indicator"}`} aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}

function Pasos() {
  return (
    <section id="como-funciona" className="scroll-mt-24 bg-pale-mint px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <PasosInteractivos />
      </div>
    </section>
  );
}

function Impacto() {
  const { data, isLoading, isError } = useQuery(impactoPublicoQuery);

  const valor = (n: number | undefined) => {
    if (isLoading) return "…";
    if (isError) return "—";
    return formatNumero(n ?? 0);
  };

  const items = [
    { icon: Recycle, v: data?.kg_desviados, unidad: "kg", label: "desviados del relleno" },
    { icon: Wind, v: data?.co2e_evitado_kg, unidad: "kg CO₂e", label: "evitado (estimado)" },
    { icon: Droplets, v: data?.agua_ahorrada_l, unidad: "litros", label: "de agua ahorrada (estimado)" },
    { icon: Handshake, v: data?.operaciones_completadas, unidad: "", label: "operaciones completadas" },
  ];

  return (
    <section id="impacto" className="scroll-mt-24 bg-pale-mint px-5 pb-24 md:px-8 md:pb-32" aria-label="Impacto">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 border-y border-step-line lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal
              key={it.label}
              className={[
                "min-w-0 border-step-line py-8 pr-3 sm:pr-6",
                i % 2 === 1 ? "border-l pl-4 sm:pl-8" : "lg:pl-8",
                i === 0 ? "lg:pl-0" : "",
                i >= 2 ? "border-t lg:border-t-0" : "",
                i === 2 ? "lg:border-l" : "",
              ].join(" ")}
            >
              <it.icon className="h-4 w-4 text-clay" strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-6 font-display text-[2.75rem] leading-none font-medium text-primary-deep tabular-nums md:text-[3.125rem]">
                {valor(it.v)}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {it.unidad && <span className="font-medium text-foreground">{it.unidad} </span>}
                {it.label}
              </p>
            </Reveal>
          ))}
        </div>
        {isError && (
          <p className="mt-6 text-sm text-muted-foreground">
            No pudimos cargar las cifras en este momento.
          </p>
        )}
      </div>
    </section>
  );
}

function Mercado() {
  return (
    <section id="mercado" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <h2 className="max-w-2xl text-title text-primary-deep md:text-[3.5rem]">
            Lotes disponibles para una segunda vida
          </h2>
        </Reveal>
        <Reveal className="mt-12 rounded-lg bg-rose-pale px-6 py-12 md:px-14 md:py-16">
          <PackageOpen className="h-6 w-6 text-primary-deep" strokeWidth={1.25} aria-hidden="true" />
          <h3 className="mt-5 text-heading text-primary-deep md:text-[2.25rem]">Aún no hay lotes publicados</h3>
          <p className="measure mt-3 text-base leading-relaxed text-foreground">
            Pronto verás aquí los materiales que las empresas de Lima y Callao ponen a
            disposición.
          </p>
          <Button className="mt-8" asChild>
            <Link to="/registro">Registrar mi empresa</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

function Pasaporte() {
  return (
    <section id="pasaporte" className="scroll-mt-24 bg-deep py-24 text-deep-foreground md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="max-w-3xl">
          <h2 className="text-title text-deep-foreground md:text-[3.5rem]">
            Cada lote tiene su pasaporte.
            <br />
            <em className="text-rose">Cada entrega, su certificado.</em>
          </h2>
          <p className="measure mt-6 text-base leading-relaxed text-deep-muted">
            Cada lote publicado recibe un código QR con su historia: origen, material y
            destino. Al completarse la entrega, ambas empresas obtienen un documento verificable.
          </p>
        </Reveal>
        <div className="mt-16 grid border-t border-gold md:grid-cols-2">
          {[
            { icon: QrCode, t: "Pasaporte del lote", d: "Un código QR único que acompaña al material en cada etapa." },
            { icon: FileCheck2, t: "Certificado de entrega", d: "Constancia descargable y verificable de cada operación." },
          ].map((c, i) => (
            <Reveal
              key={c.t}
              className={i === 0
                ? "py-10 md:pr-12"
                : "border-t border-gold py-10 md:border-t-0 md:border-l md:pl-12"}
            >
              <c.icon className="h-5 w-5 text-gold" strokeWidth={1.25} aria-hidden="true" />
              <h3 className="mt-5 text-heading text-deep-foreground">{c.t}</h3>
              <p className="measure mt-3 text-base leading-relaxed text-deep-muted">{c.d}</p>
            </Reveal>
          ))}
        </div>
        <p className="measure border-t border-gold pt-6 text-[15px] text-deep-foreground">
          Documento emitido por Remanente. No es una certificación ambiental oficial.
        </p>
      </div>
    </section>
  );
}
