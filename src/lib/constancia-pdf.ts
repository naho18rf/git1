import type { Trato } from "./tratos";
import { fechaLima } from "./lotes";
import { nombreCategoria } from "./materiales";

type Snapshot = { vendedora: { nombre: string | null; representante: string | null }; compradora: { nombre: string | null; representante: string | null }; lote: { codigo: string; categoria: string; descripcion: string; peso_kg: number } };

/** Genera la constancia en el navegador. `qrDataUrl` es el QR hacia /constancia/$numero. */
export async function descargarConstanciaPdf(trato: Trato, qrDataUrl: string) {
  const c = trato.constancia;
  if (!c) return;
  const { jsPDF } = await import("jspdf");
  const s = c.snapshot as unknown as Snapshot;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const verde: [number, number, number] = [38, 78, 54];
  doc.setFillColor(...verde); doc.circle(24, 22, 5, "F");
  doc.setFont("times", "bold"); doc.setFontSize(22); doc.setTextColor(...verde); doc.text("Remanente", 32, 25);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(90);
  doc.text("Constancia de entrega", 32, 31);
  doc.addImage(qrDataUrl, "PNG", 160, 12, 32, 32);
  doc.setTextColor(20); doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(c.numero, 18, 56);
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text(`Emitida: ${fechaLima(c.emitida_at)} (hora de Lima)`, 18, 63);
  let y = 78;
  const fila = (k: string, v: string) => { doc.setFont("helvetica", "bold"); doc.text(k, 18, y); doc.setFont("helvetica", "normal"); const lines = doc.splitTextToSize(v, 120); doc.text(lines, 70, y); y += 7 * lines.length; };
  fila("Lote", s.lote.codigo);
  fila("Categoría", nombreCategoria(s.lote.categoria));
  fila("Descripción", s.lote.descripcion);
  fila("Peso aproximado", `${s.lote.peso_kg} kg`);
  y += 4;
  fila("Empresa que entrega", s.vendedora.nombre ?? "—");
  fila("Representante registrado", s.vendedora.representante ?? "—");
  fila("Empresa que recibe", s.compradora.nombre ?? "—");
  fila("Representante registrado", s.compradora.representante ?? "—");
  y += 4;
  doc.setFont("helvetica", "bold"); doc.text("Huella SHA-256", 18, y); y += 6;
  doc.setFont("courier", "normal"); doc.setFontSize(9); doc.text(c.hash_sha256, 18, y); y += 8;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(90);
  doc.text(`Verifica en ${window.location.origin}/constancia/${c.numero}`, 18, y);
  y += 5;
  const ods = doc.splitTextToSize("Aporta a los ODS 9 y 12, con enfoque transversal en el ODS 5 (igualdad de género).", 174);
  doc.text(ods, 18, y);
  doc.setFontSize(9);
  doc.text("Constancia de entrega registrada en Remanente. No es un contrato ni una certificación ambiental oficial.", 105, 285, { align: "center" });
  doc.save(`constancia-${c.numero}.pdf`);
}
