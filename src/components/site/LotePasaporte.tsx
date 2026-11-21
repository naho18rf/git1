/**
 * Pasaporte de lote ilustrativo para la portada. Puramente decorativo:
 * datos genéricos y un código QR dibujado (no codifica nada).
 */
const N = 21;

function esFinder(x: number, y: number) {
  const enCaja = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  return enCaja(0, 0) || enCaja(N - 7, 0) || enCaja(0, N - 7);
}

function celdasQr() {
  const celdas: Array<[number, number]> = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (esFinder(x, y)) continue;
      // Separadores blancos alrededor de los marcadores
      if ((x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8)) continue;
      const h = ((x * 73856093) ^ (y * 19349663) ^ 0x5bd1e995) >>> 0;
      if (h % 7 < 3) celdas.push([x, y]);
    }
  }
  return celdas;
}

const CELDAS = celdasQr();

function QrDecorativo({ className }: { className?: string }) {
  const finder = (ox: number, oy: number) => (
    <g key={`${ox}-${oy}`}>
      <rect x={ox + 0.5} y={oy + 0.5} width={6} height={6} fill="none" stroke="currentColor" strokeWidth={1} />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} fill="currentColor" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className={className} aria-hidden="true" shapeRendering="crispEdges">
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
      {CELDAS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
      ))}
    </svg>
  );
}

const FILAS = [
  { k: "Material", v: "Tipo de material" },
  { k: "Cantidad", v: "000 kg" },
  { k: "Origen → Destino", v: "Empresa A → Empresa B" },
  { k: "Certificado", v: "Al completar la entrega" },
];

export function LotePasaporte({ className }: { className?: string }) {
  return (
    <figure
      className={`rounded-md bg-paper p-1.5 shadow-paper ring-1 ring-gold ${className ?? ""}`}
      aria-label="Ejemplo ilustrativo de pasaporte de lote"
    >
      <div className="rounded-[3px] border border-gold px-6 py-7 sm:px-8 sm:py-9">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[13px] text-clay">Ejemplo ilustrativo</p>
            <p className="mt-2 font-display text-heading text-primary-deep">Pasaporte de lote</p>
            <p className="mt-1 text-[13px] tabular-nums text-muted-foreground">N.º 0000-0000</p>
          </div>
          <QrDecorativo className="h-20 w-20 shrink-0 text-primary-deep sm:h-24 sm:w-24" />
        </div>

        <dl className="mt-8 space-y-4 text-[15px]">
          {FILAS.map((f) => (
            <div key={f.k} className="flex items-baseline gap-3">
              <dt className="shrink-0 text-muted-foreground">{f.k}</dt>
              <span className="min-w-4 flex-1 translate-y-[-4px] border-b border-dotted border-gold" aria-hidden="true" />
              <dd className="text-right text-primary-deep">{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </figure>
  );
}
