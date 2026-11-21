import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";

const PASOS = [
  { n: "01", titulo: "Fotografía", texto: "Toma una foto de tu merma o residuo desde el celular, directamente en planta." },
  { n: "02", titulo: "Publica", texto: "Crea un lote con material, cantidad y ubicación para que otras empresas lo encuentren." },
  { n: "03", titulo: "Conecta", texto: "Conversa con empresas interesadas en reutilizarlo y acuerden la entrega." },
  { n: "04", titulo: "Certifica", texto: "Cada entrega completada queda registrada con un certificado verificable." },
];

function azar(i: number, sal: number) {
  const x = Math.sin(i * 9.731 + sal * 63.17) * 15731.743;
  return Math.round((x - Math.floor(x)) * 1e6) / 1e6;
}

function usarMovimientoReducido() {
  const [reducido, setReducido] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const actualizar = () => setReducido(media.matches);
    actualizar();
    media.addEventListener("change", actualizar);
    return () => media.removeEventListener("change", actualizar);
  }, []);
  return reducido;
}

type RosaPetalProps = {
  id: string;
  angulo: number;
  r0: number;
  alto: number;
  ancho: number;
  fill: string;
  patron: "tela" | "veta" | "curva" | "hoja" | null;
  linea?: string;
  forma?: "rosa" | "hoja";
  crecimiento: number;
  indice: number;
  brisa: number;
  duracion: number;
  reducido: boolean;
};

function RosaPetal({
  id, angulo, r0, alto: h, ancho: w, fill, patron, linea,
  forma = "rosa", crecimiento, indice, brisa, duracion, reducido,
}: RosaPetalProps) {
  const d = forma === "hoja"
    ? `M0 0 C ${w} ${-h * 0.3} ${w * 0.9} ${-h * 0.78} 0 ${-h} C ${-w * 0.9} ${-h * 0.78} ${-w} ${-h * 0.3} 0 0Z`
    : `M0 0 C ${-w} ${-h * 0.15} ${-w * 1.05} ${-h * 0.95} 0 ${-h} C ${w * 1.05} ${-h * 0.95} ${w} ${-h * 0.15} 0 0Z`;
  const estilo: CSSProperties = {
    transform: `scale(${crecimiento})`,
    transformOrigin: "0px 0px",
    transitionDuration: `${620 + (indice % 5) * 115}ms`,
  };
  return (
    <g transform={`rotate(${angulo}) translate(0 ${-r0})`}>
      <g>
        {!reducido && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={`${-0.4 * brisa}; ${brisa}; ${0.2 * brisa}; ${0.8 * brisa}; ${-0.4 * brisa}`}
            keyTimes="0;0.3;0.55;0.8;1"
            calcMode="spline"
            keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
            dur={`${duracion}s`}
            begin={`${-(indice * 0.43)}s`}
            repeatCount="indefinite"
          />
        )}
        <g className="petal-grow" style={estilo}>
          <path d={d} fill={fill} />
          <clipPath id={id}><path d={d} /></clipPath>
          <g clipPath={`url(#${id})`} fill="none" stroke={linea} strokeWidth={patron === "hoja" ? 1 : 0.85}>
            {patron === "tela" && Array.from({ length: 7 }, (_, j) => {
              const x = -w * 0.75 + j * (w * 1.5 / 6);
              return <path key={j} d={`M${x} 5 L${x} ${-h - 4}`} />;
            })}
            {(patron === "veta" || patron === "curva") && Array.from({ length: 5 }, (_, j) => {
              const x = -w * 0.68 + j * (w * 1.36 / 4);
              return <path key={j} d={`M0 3 Q ${x * 1.25} ${-h * 0.45} ${x} ${-h * 0.94}`} />;
            })}
            {patron === "hoja" && (
              <>
                <path d={`M0 3 Q 2 ${-h * 0.45} 0 ${-h}`} />
                {Array.from({ length: 6 }, (_, j) => {
                  const y = -h * (0.18 + j * 0.115);
                  return <path key={j} d={`M${-w * 0.75} ${y - 8} Q0 ${y + 5} ${w * 0.75} ${y - 8}`} />;
                })}
              </>
            )}
          </g>
          {forma === "rosa" && (
            <path
              d={`M${-w * 0.62} ${-h * 0.8} Q0 ${-h * 1.06} ${w * 0.62} ${-h * 0.8}`}
              fill="none"
              stroke={linea ?? fill}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}
        </g>
      </g>
    </g>
  );
}

const CAPAS = [
  { key: "sep", cantidad: 5, separacion: 72, extra: 18, r0: 8, alto: 152, ancho: 26, fill: "var(--leaf-green)", linea: "var(--leaf-vein)", patron: "hoja" as const, forma: "hoja" as const, crecimiento: [0.6, 1, 1, 1], brisa: 2.2, duracion: 7 },
  { key: "r1", cantidad: 7, separacion: 360 / 7, extra: 0, r0: 18, alto: 140, ancho: 60, fill: "var(--rose-soft)", linea: "var(--textile-line)", patron: "tela" as const, forma: "rosa" as const, crecimiento: [0, 0, 0.4, 1], brisa: 2.6, duracion: 7.5 },
  { key: "r2", cantidad: 6, separacion: 60, extra: 20, r0: 14, alto: 112, ancho: 50, fill: "var(--gold)", linea: "var(--wood-vein)", patron: "veta" as const, forma: "rosa" as const, crecimiento: [0, 0, 0.65, 1], brisa: 2.2, duracion: 6.8 },
  { key: "r3", cantidad: 5, separacion: 72, extra: 35, r0: 10, alto: 86, ancho: 40, fill: "var(--rose-pale)", linea: "var(--petal-line)", patron: "curva" as const, forma: "rosa" as const, crecimiento: [0, 0.6, 1, 1], brisa: 1.8, duracion: 6.2 },
  { key: "r4", cantidad: 4, separacion: 90, extra: 10, r0: 6, alto: 62, ancho: 30, fill: "var(--petal-deep)", linea: "var(--petal-deep)", patron: null, forma: "rosa" as const, crecimiento: [0.5, 1, 1, 1], brisa: 1.4, duracion: 5.6 },
  { key: "c", cantidad: 3, separacion: 120, extra: 0, r0: 3, alto: 38, ancho: 18, fill: "var(--rose)", linea: "var(--rose)", patron: null, forma: "rosa" as const, crecimiento: [0.7, 1, 1, 1], brisa: 1, duracion: 5 },
];

function PanelRosa({ paso, reducido }: { paso: number; reducido: boolean }) {
  const particulas = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    x: azar(i, 1) * 400,
    y: 35 + azar(i, 2) * 330,
    r: 0.7 + azar(i, 3) * 1.6,
    velocidad: 2 + azar(i, 4) * 5,
    fase: azar(i, 5) * Math.PI * 2,
  })), []);
  const nodos = useRef<Array<SVGCircleElement | null>>([]);
  const rosa = useRef<SVGGElement | null>(null);
  const inclinacion = useRef(0);
  const objetivo = useRef(0);

  useEffect(() => {
    let frame = 0;
    const inicio = performance.now();
    const dibujar = (ahora: number) => {
      const tiempo = reducido ? 0 : (ahora - inicio) / 1000;
      particulas.forEach((p, i) => {
        const nodo = nodos.current[i];
        if (!nodo) return;
        const x = ((p.x + tiempo * p.velocidad + 20) % 440) - 20;
        const y = p.y + Math.sin(tiempo * 0.45 + p.fase) * 5;
        nodo.setAttribute("cx", x.toFixed(2));
        nodo.setAttribute("cy", y.toFixed(2));
      });
      inclinacion.current += (objetivo.current - inclinacion.current) * 0.06;
      rosa.current?.setAttribute(
        "transform",
        `translate(200 198) scale(0.9) rotate(${inclinacion.current.toFixed(3)})`,
      );
      if (!reducido) frame = requestAnimationFrame(dibujar);
    };
    dibujar(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [particulas, reducido]);

  const mover = (event: PointerEvent<HTMLDivElement>) => {
    if (reducido) return;
    const caja = event.currentTarget.getBoundingClientRect();
    objetivo.current = ((event.clientX - caja.left) / caja.width - 0.5) * 12;
  };

  return (
    <div
      className="step-panel relative min-h-[400px] overflow-hidden rounded-lg text-deep-foreground"
      onPointerMove={mover}
      onPointerLeave={() => { objetivo.current = 0; }}
    >
      <p className="absolute top-5 left-5 z-10 text-[13px] text-deep-muted">Paso {paso + 1} de 4</p>
      <p className="absolute bottom-5 left-5 z-10 text-[13px] text-deep-foreground">Cada paso abre un poco más tu lote.</p>
      <svg viewBox="0 0 400 400" className="h-full min-h-[400px] w-full" aria-hidden="true">
        <g fill="var(--mint)">
          {particulas.map((p, i) => (
            <circle
              key={i}
              ref={(nodo) => { nodos.current[i] = nodo; }}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fillOpacity={0.25 + azar(i, 7) * 0.45}
            />
          ))}
        </g>
        <g ref={rosa} transform="translate(200 198) scale(0.9)">
          {CAPAS.map((capa) => Array.from({ length: capa.cantidad }, (_, i) => (
            <RosaPetal
              key={`${capa.key}-${i}`}
              id={`rosa-${capa.key}-${i}`}
              angulo={i * capa.separacion + capa.extra}
              r0={capa.r0}
              alto={capa.alto}
              ancho={capa.ancho}
              fill={capa.fill}
              linea={capa.linea}
              patron={capa.patron}
              forma={capa.forma}
              crecimiento={capa.crecimiento[paso] ?? 0}
              indice={i}
              brisa={capa.brisa}
              duracion={capa.duracion}
              reducido={reducido}
            />
          )))}
          <path
            d="M0 0 C8 -8 18 2 12 12 C4 25 -18 18 -20 2 C-23 -20 4 -34 25 -20"
            fill="none"
            stroke="var(--ivory)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
        {paso === 3 && (
          <g transform="translate(336 338)">
            <circle r="40" fill="var(--rose)" stroke="var(--ivory)" strokeWidth="1.5" />
            <text textAnchor="middle" y="-3" fill="var(--night)" fontFamily="var(--font-display)" fontWeight="600" fontSize="13">Certificado</text>
            <text textAnchor="middle" y="14" fill="var(--night)" fontFamily="var(--font-display)" fontWeight="600" fontSize="13">de entrega</text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function PasosInteractivos() {
  const [paso, setPaso] = useState(0);
  const [detenido, setDetenido] = useState(false);
  const reducido = usarMovimientoReducido();

  useEffect(() => {
    if (detenido || reducido) return;
    const intervalo = window.setInterval(() => setPaso((actual) => (actual + 1) % 4), 4600);
    return () => window.clearInterval(intervalo);
  }, [detenido, reducido]);

  const elegir = (indice: number) => {
    setPaso(indice);
    setDetenido(true);
  };

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div>
        <h2 className="max-w-md text-title text-primary-deep md:text-[3.25rem]">
          Del residuo al recurso, en cuatro pasos
        </h2>
        <div className="mt-10 space-y-1">
          {PASOS.map((p, i) => (
            <button
              key={p.n}
              type="button"
              aria-pressed={paso === i}
              onClick={() => elegir(i)}
              className="w-full rounded-md px-2 py-4 text-left transition-colors hover:bg-surface/65 sm:px-4"
            >
              <span className="grid grid-cols-[2.5rem_1fr] gap-4">
                <span className="font-display text-[28px] leading-none text-gold">{p.n}</span>
                <span>
                  <span className="block font-display text-[25px] leading-tight text-primary-deep">{p.titulo}</span>
                  {paso === i && (
                    <span id={`paso-descripcion-${i}`} className="measure mt-2 block text-[15px] leading-relaxed text-muted-foreground">
                      {p.texto}
                    </span>
                  )}
                </span>
              </span>
              <span className="mt-4 ml-14 block h-0.5 overflow-hidden bg-step-line" aria-hidden="true">
                {paso === i && (
                  <span
                    key={`${paso}-${detenido}-${reducido}`}
                    className={`block h-full w-full bg-primary-deep ${detenido || reducido ? "scale-x-100" : "step-fill"}`}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
      <PanelRosa paso={paso} reducido={reducido} />
    </div>
  );
}
