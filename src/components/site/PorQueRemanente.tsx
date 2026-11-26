import { Reveal } from "@/components/site/Reveal";

const DATOS = [
  {
    cifra: "41 %",
    texto: "del empleo en la industria manufacturera peruana corresponde a mujeres: 621 mil de 1,5 millones de personas (2025).",
    fuente: "SNI-IEES, con datos de la EPEN del INEI",
    href: "https://sni.org.pe/sni-participacion-de-la-mujer-en-la-industria-manufacturera-nacional-crecio-2-5-en-el-2025/",
  },
  {
    cifra: "51,9 %",
    texto: "de las empresas creadas en el Perú en 2025 fueron lideradas por mujeres.",
    fuente: "INEI, publicado en El Peruano",
    href: "https://elperuano.pe/noticia/290574-en-el-2025-las-mujeres-lideraron-el-519-de-las-empresas-creadas-en-el-peru",
  },
  {
    cifra: "Cerca del 80 %",
    texto: "de los residuos que se generan en el país pueden aprovecharse de forma sostenible, según el MINAM.",
    fuente: "Ministerio del Ambiente",
    href: "https://www.gob.pe/institucion/minam/noticias/1249717-minam-cerca-del-80-de-los-residuos-que-se-generan-en-el-pais-pueden-ser-aprovechados-de-forma-sostenible",
  },
];

const ODS = [
  { n: "12", titulo: "Producción y consumo responsables", texto: "Cada lote entregado es un residuo que se reutiliza como materia prima." },
  { n: "9", titulo: "Industria, innovación e infraestructura", texto: "Digitalizamos el intercambio de subproductos entre empresas, con trazabilidad." },
  { n: "5", titulo: "Igualdad de género", texto: "Más acceso, visibilidad y oportunidades para las mujeres que lideran y emprenden." },
];

export function PorQueRemanente() {
  return (
    <section id="por-que" className="scroll-mt-24 py-24 md:py-32" aria-label="Por qué Remanente">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-clay">Por qué Remanente</p>
          <h2 className="mt-4 text-title text-primary-deep md:text-[3.5rem]">
            Hay oportunidad en lo que hoy se descarta
          </h2>
          <p className="measure mt-6 text-base leading-relaxed text-foreground">
            Las empresas generan residuos que otras pueden usar, y las mujeres ya sostienen buena parte de la
            industria y de los nuevos negocios. Remanente las conecta.
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {DATOS.map((d) => (
            <li key={d.cifra} className="surface-card flex flex-col p-7">
              <p className="font-display text-[2.75rem] leading-none font-medium text-primary-deep">{d.cifra}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-foreground">{d.texto}</p>
              <a
                href={d.href}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-auto pt-5 text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
              >
                Fuente: {d.fuente}
              </a>
            </li>
          ))}
        </ul>

        <h3 className="mt-16 text-heading text-primary-deep">Objetivos de Desarrollo Sostenible a los que aportamos</h3>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {ODS.map((o) => (
            <li key={o.n} className="rounded-lg bg-rose-pale p-6">
              <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                ODS {o.n}
              </span>
              <p className="mt-4 font-display text-lg text-primary-deep">{o.titulo}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{o.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
