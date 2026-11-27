import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  LockOpen,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_EMPRESAS, DEMO_FICHA, DEMO_LOTE, huellaDemo } from "@/lib/demo-datos";
import { nombreCategoria } from "@/lib/materiales";

const PASOS = [
  "Foto y ficha con IA",
  "Lote publicado",
  "Solicitud y contacto",
  "Entrega y constancia",
  "Impacto",
] as const;

export function DemoRecorrido() {
  const [paso, setPaso] = useState(0);
  return (
    <div>
      <p role="note" className="rounded-md bg-rose-pale px-5 py-4 text-sm text-foreground">
        <strong>Demostración.</strong> Las empresas, el lote y las cifras de esta página son
        ficticios y no se guardan en ninguna base de datos. Sirve para recorrer el flujo completo
        sin depender de datos reales.
      </p>

      <ol className="mt-8 flex flex-wrap gap-2" aria-label="Pasos de la demostración">
        {PASOS.map((nombre, i) => (
          <li key={nombre}>
            <button
              type="button"
              onClick={() => setPaso(i)}
              aria-current={i === paso ? "step" : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-[13px] transition-colors ${
                i === paso
                  ? "border-primary/30 bg-mint text-primary"
                  : "border-border bg-surface text-muted-foreground hover:text-primary"
              }`}
            >
              <span className="font-display text-gold">0{i + 1}</span>
              {nombre}
            </button>
          </li>
        ))}
      </ol>

      <div className="surface-card mt-6 p-6 md:p-8">
        {paso === 0 && <PasoFicha />}
        {paso === 1 && <PasoLote />}
        {paso === 2 && <PasoContacto />}
        {paso === 3 && <PasoConstancia />}
        {paso === 4 && <PasoImpacto />}
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" disabled={paso === 0} onClick={() => setPaso(paso - 1)}>
          <ArrowLeft /> Anterior
        </Button>
        <Button disabled={paso === PASOS.length - 1} onClick={() => setPaso(paso + 1)}>
          Siguiente <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

function Titulo({ n, children, nota }: { n: string; children: string; nota: string }) {
  return (
    <>
      <span className="font-display text-xl text-gold">{n}</span>
      <h2 className="mt-1 text-heading text-primary-deep">{children}</h2>
      <p className="measure mt-2 text-sm text-muted-foreground">{nota}</p>
    </>
  );
}

function PasoFicha() {
  const f = DEMO_FICHA;
  return (
    <div>
      <Titulo
        n="01"
        nota="Subes hasta 3 fotos y la IA propone la ficha. Tú la revisas y la editas; no estima precio ni peso."
      >
        De la foto a la ficha
      </Titulo>
      <div className="mt-6 grid gap-6 md:grid-cols-[14rem_1fr]">
        <div
          className="grid grid-cols-3 gap-2 md:grid-cols-1"
          aria-label="Fotos de ejemplo (espacio de foto)"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-gradient-to-br from-mint to-rose-pale"
            />
          ))}
        </div>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-[13px] text-clay">Material sugerido</dt>
            <dd className="text-foreground">
              {f.nombre_material} · {nombreCategoria(f.categoria ?? "")}{" "}
              <Badge variant="outline">Confianza {f.confianza}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-clay">Estado visible</dt>
            <dd className="text-foreground">{f.condicion}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-clay">Usos posibles en Lima y Callao</dt>
            <dd>
              <ul className="list-disc pl-5 text-foreground">
                {f.usos_posibles.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-clay">Lo que no se puede saber desde las fotos</dt>
            <dd className="text-foreground">{f.no_se_puede_saber}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function PasoLote() {
  return (
    <div>
      <Titulo
        n="02"
        nota="El equipo revisa el lote antes de mostrarlo. Cada lote tiene un pasaporte con QR."
      >
        Lote publicado en el mercado
      </Titulo>
      <div className="mt-6 max-w-sm rounded-lg border border-border bg-surface p-5">
        <div className="aspect-video rounded-md bg-gradient-to-br from-mint to-rose-pale" />
        <p className="mt-4 font-display text-xl text-primary-deep">
          {DEMO_EMPRESAS.generadora.nombre}
        </p>
        <p className="text-sm text-muted-foreground">
          {nombreCategoria(DEMO_LOTE.categoria)} · {DEMO_LOTE.pesoKg} kg · {DEMO_LOTE.distrito}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Código {DEMO_LOTE.codigo}</p>
      </div>
    </div>
  );
}

function PasoContacto() {
  const [aceptado, setAceptado] = useState(false);
  const r = DEMO_EMPRESAS.receptora;
  return (
    <div>
      <Titulo
        n="03"
        nota="Antes de aceptar, la otra empresa solo ve el nombre comercial. Los datos de contacto aparecen cuando el trato empieza."
      >
        Solicitud y contacto
      </Titulo>
      <p className="mt-6 text-sm text-foreground">
        <strong>{r.nombre}</strong> solicitó el lote {DEMO_LOTE.codigo}.
      </p>
      <div className="mt-4 rounded-lg border border-border bg-surface p-5">
        <p className="flex items-center gap-2 text-[13px] text-clay">
          {aceptado ? (
            <LockOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Lock className="h-4 w-4" aria-hidden="true" />
          )}
          {aceptado
            ? "Contacto visible: el trato fue aceptado"
            : "Contacto oculto: la solicitud está pendiente"}
        </p>
        <p className="mt-3 text-foreground">{r.nombre}</p>
        {aceptado ? (
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            <li>{r.representante}</li>
            <li>WhatsApp: {r.whatsapp}</li>
            <li>{r.correo}</li>
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Teléfono, WhatsApp y correo no se muestran todavía.
          </p>
        )}
      </div>
      <Button
        className="mt-4"
        variant={aceptado ? "outline" : "default"}
        onClick={() => setAceptado(!aceptado)}
      >
        {aceptado ? "Volver a solicitud pendiente" : "Aceptar solicitud"}
      </Button>
    </div>
  );
}

function PasoConstancia() {
  const [peso, setPeso] = useState<number>(DEMO_LOTE.pesoKg);
  const [original, setOriginal] = useState("");
  const [actual, setActual] = useState("");

  useEffect(() => {
    void huellaDemo(DEMO_LOTE.pesoKg).then(setOriginal);
  }, []);
  useEffect(() => {
    void huellaDemo(peso).then(setActual);
  }, [peso]);

  const listo = original !== "" && actual !== "";
  const valida = listo && original === actual;

  return (
    <div>
      <Titulo
        n="04"
        nota="Al confirmar la recepción se emite una constancia con una huella digital. Si alguien cambia un dato, la huella ya no coincide."
      >
        Entrega y constancia verificable
      </Titulo>
      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <p className="text-[13px] text-clay">Constancia de ejemplo</p>
        <p className="mt-1 font-display text-lg text-primary-deep">CE-DEMO-0001</p>
        <label htmlFor="demo-peso" className="mt-4 block text-sm font-medium">
          Peso entregado (kg) — pruébalo cambiando el número
        </label>
        <input
          id="demo-peso"
          type="number"
          min={1}
          value={peso}
          onChange={(e) => setPeso(Math.max(1, Number(e.target.value) || 1))}
          className="mt-1 h-11 w-40 rounded-md border border-input bg-background px-3 text-sm"
        />
        <p className="mt-4 text-[13px] text-clay">Huella registrada al emitir</p>
        <p className="break-all font-mono text-xs text-muted-foreground">
          {original || "calculando…"}
        </p>
        <p className="mt-3 text-[13px] text-clay">Huella de los datos actuales</p>
        <p className="break-all font-mono text-xs text-muted-foreground">
          {actual || "calculando…"}
        </p>
        <p
          role="status"
          className={`mt-4 flex items-center gap-2 text-sm font-medium ${valida ? "text-primary" : "text-destructive"}`}
        >
          {!listo ? null : valida ? (
            <>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Verificada: los datos no fueron
              alterados.
            </>
          ) : (
            <>
              <ShieldAlert className="h-4 w-4" aria-hidden="true" /> No coincide: los datos fueron
              modificados.
            </>
          )}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Documento emitido por Remanente. No es una certificación ambiental oficial.
        </p>
      </div>
    </div>
  );
}

function PasoImpacto() {
  return (
    <div>
      <Titulo n="05" nota="Solo cuentan los lotes con entrega confirmada por quien los recibió.">
        Se suma al impacto
      </Titulo>
      <div className="mt-6 grid max-w-md grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="font-display text-4xl text-primary-deep tabular-nums">{DEMO_LOTE.pesoKg}</p>
          <p className="mt-1 text-sm text-muted-foreground">kg desviados (demo)</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="font-display text-4xl text-primary-deep tabular-nums">1</p>
          <p className="mt-1 text-sm text-muted-foreground">operación completada (demo)</p>
        </div>
      </div>
      <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        El CO₂e y el agua se mostrarán cuando existan factores con fuente citada: no publicamos
        cifras sin respaldo.
      </p>
    </div>
  );
}
