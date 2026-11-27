import { fechaLima } from "./lotes";
import { formatNumero } from "./impact";
import { sumarImpacto } from "./premium-reglas";

type Fila = {
  fecha: string | null;
  constancia: string;
  kg_desviados: number;
  co2e_evitado_kg: number;
  agua_ahorrada_l: number;
};

export async function descargarReportePdf({ empresa, filas }: { empresa: string; filas: Fila[] }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const t = sumarImpacto(filas);
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.text("Remanente", 18, 24);
  doc.setFontSize(14);
  doc.text("Reporte de impacto", 18, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(empresa, 174), 18, 43);
  doc.text(`Generado: ${fechaLima(new Date().toISOString())} (hora de Lima)`, 18, 55);
  let y = 68;
  for (const linea of [
    `Operaciones completadas: ${t.operaciones}`,
    `Material desviado: ${formatNumero(t.kg)} kg`,
    `CO2e evitado (estimado): ${formatNumero(t.co2e)} kg`,
    `Agua ahorrada (estimada): ${formatNumero(t.agua)} litros`,
  ]) {
    doc.text(linea, 18, y);
    y += 7;
  }
  y += 8;
  const cabecera = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Fecha", 18, y);
    doc.text("Constancia", 80, y);
    doc.text("Kg", 150, y);
    doc.setFont("helvetica", "normal");
    y += 7;
  };
  if (filas.length) cabecera();
  else doc.text("Aún no tienes entregas completadas.", 18, y);
  for (const f of filas) {
    if (y > 270) {
      doc.addPage();
      y = 20;
      cabecera();
    }
    doc.text(f.fecha ? fechaLima(f.fecha) : "—", 18, y);
    doc.text(f.constancia, 80, y);
    doc.text(formatNumero(f.kg_desviados), 150, y);
    y += 6;
  }
  doc.setFontSize(9);
  doc.text(
    "Documento emitido por Remanente. No es una certificación ambiental oficial.",
    105,
    288,
    { align: "center" },
  );
  doc.save("reporte-impacto-remanente.pdf");
}
