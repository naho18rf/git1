import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DISTRITOS } from "@/lib/peru";
import { MATERIALES_PERMITIDOS } from "@/lib/materiales";

export type Detalles = { categoria: string; descripcion: string; peso_kg: string; empaque: string; distrito: string };
export function DetallesLote({ value, onChange, categoria = true }: { value: Detalles; onChange: (v: Detalles) => void; categoria?: boolean }) {
  function field(key: keyof Detalles, val: string) { onChange({ ...value, [key]: val }); }
  const selectClass = "mt-2 h-11 w-full rounded-md border border-input bg-surface px-3 text-sm";
  return <div className="grid gap-6 sm:grid-cols-2">
    {categoria && <div className="sm:col-span-2"><label htmlFor="categoria" className="text-sm font-medium">Categoría</label><select id="categoria" required value={value.categoria} onChange={e => field("categoria", e.target.value)} className={selectClass}><option value="">Elige un material permitido</option>{MATERIALES_PERMITIDOS.map(m => <option key={m.clave} value={m.clave}>{m.nombre}</option>)}</select><p className="mt-2 text-sm text-muted-foreground">{MATERIALES_PERMITIDOS.find(m => m.clave === value.categoria)?.descripcion}</p></div>}
    <div className="sm:col-span-2"><label htmlFor="descripcion" className="text-sm font-medium">Descripción del lote</label><Textarea id="descripcion" required minLength={10} maxLength={1000} value={value.descripcion} onChange={e => field("descripcion", e.target.value)} className="mt-2" /></div>
    <div><label htmlFor="peso" className="text-sm font-medium">Peso aproximado (kg)</label><Input id="peso" type="number" min="0.001" max="1000000" step="any" required value={value.peso_kg} onChange={e => field("peso_kg", e.target.value)} className="mt-2" /></div>
    <div><label htmlFor="empaque" className="text-sm font-medium">Empaque</label><Input id="empaque" required minLength={2} maxLength={120} value={value.empaque} onChange={e => field("empaque", e.target.value)} className="mt-2" /></div>
    <div className="sm:col-span-2"><label htmlFor="distrito" className="text-sm font-medium">Distrito</label><select id="distrito" required value={value.distrito} onChange={e => field("distrito", e.target.value)} className={selectClass}><option value="">Elige tu distrito</option>{DISTRITOS.map(d => <option key={d}>{d}</option>)}</select></div>
  </div>;
}