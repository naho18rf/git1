import { useEffect, useMemo, useRef, useState } from "react";

const COLORES = [
  "var(--mint)",
  "var(--rose)",
  "var(--rose-soft)",
  "var(--gold)",
  "var(--ivory)",
  "var(--leaf-green)",
];

const CIRCULOS = [
  [610, 82, 68], [476, 110, 34], [650, 224, 52], [390, 230, 18],
  [558, 352, 70], [660, 450, 42], [424, 480, 58], [540, 552, 24],
  [348, 390, 12], [635, 548, 64], [462, 310, 9], [585, 178, 16],
] as const;

function azar(i: number, sal: number) {
  const x = Math.sin(i * 12.9898 + sal * 78.233) * 43758.5453;
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

type Particula = {
  t0: number;
  off: number;
  fase: number;
  velocidad: number;
  radio: number;
  color: string;
  rectangulo: boolean;
  rotacion: number;
  opacidad: number;
};

function puntoCurva(t: number) {
  const u = 1 - t;
  return {
    x: u * u * -30 + 2 * u * t * 250 + t * t * 500,
    y: u * u * 600 + 2 * u * t * 585 + t * t * 370,
  };
}

function fotograma(p: Particula, tiempo: number) {
  const t = (p.t0 + tiempo * p.velocidad) % 1;
  const punto = puntoCurva(t);
  const lateral = p.off * (5 + 72 * Math.pow(t, 1.35))
    + Math.sin(tiempo * 0.9 + p.fase + t * 5) * (2 + 7 * t);
  const x = punto.x + lateral;
  const y = punto.y + Math.cos(tiempo * 0.7 + p.fase) * 2 * t;
  const entrada = Math.min(1, t / 0.06);
  const salida = t > 0.9 ? Math.max(0, (1 - t) / 0.1) : 1;
  return { x, y, opacidad: entrada * salida };
}

type PetaloProps = {
  id: string;
  angulo: number;
  r0: number;
  largo: number;
  ancho: number;
  fill: string;
  patron: "tela" | "veta" | "metal" | null;
  linea?: string;
  brisa: number;
  duracion: number;
  inicio: number;
  reducido: boolean;
};

function Petalo({
  id, angulo, r0, largo: len, ancho: w, fill, patron, linea,
  brisa, duracion, inicio, reducido,
}: PetaloProps) {
  const d = `M0 0 C ${w} ${-len * 0.25} ${w} ${-len * 0.85} 0 ${-len} C ${-w} ${-len * 0.85} ${-w} ${-len * 0.25} 0 0Z`;
  const a = brisa;
  return (
    <g transform={`rotate(${angulo}) translate(0 ${-r0})`}>
      <g>
        {!reducido && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={`${-0.4 * a}; ${a}; ${0.2 * a}; ${0.8 * a}; ${-0.4 * a}`}
            keyTimes="0;0.3;0.55;0.8;1"
            calcMode="spline"
            keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
            dur={`${duracion}s`}
            begin={`${inicio}s`}
            repeatCount="indefinite"
          />
        )}
        <path d={d} fill={fill} />
        <clipPath id={id}><path d={d} /></clipPath>
        <g clipPath={`url(#${id})`} stroke={linea} strokeWidth="0.75" fill="none">
          {patron === "tela" && Array.from({ length: 7 }, (_, j) => {
            const x = -w * 0.72 + j * (w * 1.44 / 6);
            return <path key={j} d={`M${x} 4 L${x} ${-len - 4}`} />;
          })}
          {patron === "veta" && Array.from({ length: 5 }, (_, j) => {
            const x = -w * 0.65 + j * (w * 1.3 / 4);
            return <path key={j} d={`M0 2 Q ${x * 1.3} ${-len * 0.42} ${x} ${-len * 0.94}`} />;
          })}
          {patron === "metal" && Array.from({ length: 9 }, (_, j) => {
            const y = -len * (0.1 + j * 0.1);
            return <path key={j} d={`M${-w - 3} ${y} L${w + 3} ${y}`} />;
          })}
        </g>
      </g>
    </g>
  );
}

export function HeroFlow() {
  const reducido = usarMovimientoReducido();
  const nodos = useRef<Array<SVGGElement | null>>([]);
  const particulas = useMemo<Particula[]>(() => Array.from({ length: 190 }, (_, i) => {
    const t0 = azar(i, 1);
    const radio = Math.round((0.9 + Math.pow(azar(i, 4), 2.2) * (1.6 + 16 * Math.pow(t0, 1.5))) * 1e6) / 1e6;
    return {
      t0,
      off: azar(i, 2) * 2 - 1,
      fase: azar(i, 3) * Math.PI * 2,
      velocidad: 0.01 + azar(i, 5) * 0.016,
      radio,
      color: COLORES[i % COLORES.length] ?? "var(--mint)",
      rectangulo: radio <= 6 && azar(i, 6) < 0.22,
      rotacion: azar(i, 7) * 180,
      opacidad: Math.round((radio > 6 ? 0.16 + azar(i, 8) * 0.2 : 0.5 + azar(i, 8) * 0.5) * 1e6) / 1e6,
    };
  }), []);

  useEffect(() => {
    let frame = 0;
    const inicio = performance.now();
    const dibujar = (ahora: number) => {
      const tiempo = reducido ? 0 : (ahora - inicio) / 1000;
      particulas.forEach((p, i) => {
        const nodo = nodos.current[i];
        if (!nodo) return;
        const f = fotograma(p, tiempo);
        nodo.setAttribute("transform", `translate(${f.x.toFixed(2)} ${f.y.toFixed(2)})`);
        nodo.setAttribute("opacity", f.opacidad.toFixed(3));
      });
      if (!reducido) frame = requestAnimationFrame(dibujar);
    };
    dibujar(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [particulas, reducido]);

  return (
    <svg
      viewBox="0 0 680 620"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <g>
        {CIRCULOS.map(([cx, cy, r], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={i % 3 === 0 ? "var(--rose-soft)" : "var(--mint)"}
            fillOpacity={0.06 + (i % 6) * 0.02}
            stroke={i % 3 === 0 ? "var(--rose-soft)" : "var(--mint)"}
            strokeOpacity="0.18"
          />
        ))}
      </g>

      <g>
        {particulas.map((p, i) => {
          const f = fotograma(p, 0);
          return (
            <g
              key={i}
              ref={(nodo) => { nodos.current[i] = nodo; }}
              transform={`translate(${f.x.toFixed(3)} ${f.y.toFixed(3)})`}
              opacity={f.opacidad.toFixed(3)}
              color={p.color}
            >
              {p.rectangulo ? (
                <rect
                  x={-p.radio * 1.6}
                  y={-p.radio * 0.6}
                  width={p.radio * 3.2}
                  height={p.radio * 1.2}
                  rx={Math.min(0.8, p.radio * 0.18)}
                  fill="currentColor"
                  fillOpacity={p.opacidad}
                  transform={`rotate(${p.rotacion})`}
                />
              ) : (
                <circle
                  r={p.radio}
                  fill="currentColor"
                  fillOpacity={p.opacidad}
                  stroke={p.radio > 6 ? "currentColor" : "none"}
                  strokeOpacity={p.radio > 6 ? 0.35 : undefined}
                  strokeWidth={p.radio > 6 ? 0.8 : undefined}
                />
              )}
            </g>
          );
        })}
      </g>

      <g transform="translate(540 290) scale(0.8)">
        <g>
          {!reducido && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-1.6;1.8;-1.6"
              keyTimes="0;0.5;1"
              calcMode="spline"
              keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
              dur="9s"
              repeatCount="indefinite"
            />
          )}
          {Array.from({ length: 12 }, (_, i) => (
            <Petalo
              key={`exterior-${i}`}
              id={`hero-exterior-${i}`}
              angulo={i * 30}
              r0={46}
              largo={128}
              ancho={30}
              fill={i % 2 === 0 ? "var(--rose-soft)" : "var(--mint)"}
              patron={i % 2 === 0 ? "tela" : null}
              linea="var(--textile-line)"
              brisa={3.6}
              duracion={7.5}
              inicio={-(i * 0.55)}
              reducido={reducido}
            />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <Petalo
              key={`medio-${i}`}
              id={`hero-medio-${i}`}
              angulo={i * 30 + 15}
              r0={30}
              largo={92}
              ancho={24}
              fill={i % 2 === 0 ? "var(--gold)" : "var(--leaf-green)"}
              patron={i % 2 === 0 ? "veta" : null}
              linea="var(--wood-vein)"
              brisa={2.6}
              duracion={6.5}
              inicio={-(i * 0.5 + 0.3)}
              reducido={reducido}
            />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <Petalo
              key={`interior-${i}`}
              id={`hero-interior-${i}`}
              angulo={i * 45}
              r0={14}
              largo={56}
              ancho={17}
              fill="var(--ivory)"
              patron="metal"
              linea="var(--brushed-line)"
              brisa={1.6}
              duracion={5.5}
              inicio={-(i * 0.6)}
              reducido={reducido}
            />
          ))}
          <circle r="14" fill="var(--rose-soft)" stroke="var(--ivory)" strokeWidth="2" />
          <circle r="5" fill="var(--ivory)" />
        </g>
      </g>
    </svg>
  );
}
