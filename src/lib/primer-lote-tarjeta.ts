import { formatoKg, type DatosTarjeta } from "./primer-lote";

const W = 1080;
const H = 1350;
const C = {
  bosque: "#145C43",
  oscuro: "#0B382B",
  menta: "#DCEFE5",
  marfil: "#FBF7F2",
  rosa: "#F3DCD8",
  dorado: "#C69A86",
  marron: "#8A5A4B",
  texto: "#2F4A40",
  textoSuave: "#5C7268",
};
const SERIF = '"Fraunces", Georgia, serif';
const SANS = '"Manrope", system-ui, sans-serif';

/** Texto con separación entre letras (letterSpacing del canvas no existe en todos los navegadores). */
function textoEspaciado(ctx: CanvasRenderingContext2D, texto: string, cx: number, y: number, espacio: number) {
  const letras = [...texto];
  const anchos = letras.map((l) => ctx.measureText(l).width);
  const total = anchos.reduce((a, b) => a + b, 0) + espacio * (letras.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = "left";
  letras.forEach((l, i) => {
    ctx.fillText(l, x, y);
    x += (anchos[i] ?? 0) + espacio;
  });
}

function recortar(ctx: CanvasRenderingContext2D, texto: string, ancho: number) {
  if (ctx.measureText(texto).width <= ancho) return texto;
  let t = texto;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > ancho) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

function rectRedondeado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Dibuja la tarjeta (1080×1350, formato vertical para redes) y devuelve el PNG. Solo se usa en el navegador. */
export async function generarTarjetaPng(d: DatosTarjeta): Promise<Blob> {
  try {
    await Promise.all([document.fonts.load(`500 80px ${SERIF}`), document.fonts.load(`500 30px ${SANS}`)]);
  } catch {
    // Si las fuentes no cargan, el canvas usa las de respaldo.
  }
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo crear la tarjeta.");

  ctx.fillStyle = C.marfil;
  ctx.fillRect(0, 0, W, H);

  // Arco con degradado menta → rosa empolvado
  const g = ctx.createLinearGradient(90, 110, 990, 790);
  g.addColorStop(0, C.menta);
  g.addColorStop(1, C.rosa);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(90, 790);
  ctx.lineTo(90, 560);
  ctx.arc(540, 560, 450, Math.PI, 0);
  ctx.lineTo(990, 790);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = C.marron;
  ctx.font = `500 26px ${SANS}`;
  textoEspaciado(ctx, "MI PRIMER LOTE", 540, 290, 5);

  ctx.textAlign = "center";
  ctx.fillStyle = C.texto;
  ctx.font = `500 54px ${SERIF}`;
  ctx.fillText("Dimos una segunda vida a", 540, 400);

  ctx.fillStyle = C.bosque;
  ctx.font = `500 200px ${SERIF}`;
  ctx.fillText(`${formatoKg(d.kg)} kg`, 540, 600);

  ctx.fillStyle = C.textoSuave;
  ctx.font = `400 26px ${SANS}`;
  ctx.fillText("peso aproximado", 540, 650);

  // Material y empresa
  ctx.fillStyle = C.marron;
  ctx.font = `500 26px ${SANS}`;
  textoEspaciado(ctx, d.categoria.toUpperCase(), 540, 880, 4);
  if (d.empresa) {
    ctx.textAlign = "center";
    ctx.fillStyle = C.oscuro;
    ctx.font = `500 44px ${SERIF}`;
    ctx.fillText(recortar(ctx, d.empresa, 880), 540, 950);
  }

  // Chips de ODS
  ctx.font = `500 26px ${SANS}`;
  ["ODS 9", "ODS 12", "ODS 5"].forEach((txt, i) => {
    const x = 540 + (i - 1) * 190 - 80;
    rectRedondeado(ctx, x, 1000, 160, 54, 27);
    ctx.fillStyle = i === 2 ? C.rosa : C.menta;
    ctx.fill();
    ctx.fillStyle = C.oscuro;
    ctx.textAlign = "center";
    ctx.fillText(txt, x + 80, 1036);
  });

  // Pie
  ctx.fillStyle = C.oscuro;
  ctx.fillRect(0, 1130, W, H - 1130);
  ctx.fillStyle = C.menta;
  ctx.beginPath();
  ctx.arc(120, 1202, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.bosque;
  ctx.beginPath();
  ctx.arc(120, 1202, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "left";
  ctx.fillStyle = C.marfil;
  ctx.font = `500 44px ${SERIF}`;
  ctx.fillText("Remanente", 168, 1217);
  ctx.fillStyle = C.dorado;
  ctx.font = `400 24px ${SANS}`;
  ctx.fillText(`Constancia ${d.numeroConstancia}`, 90, 1275);
  ctx.fillStyle = C.menta;
  ctx.font = `400 22px ${SANS}`;
  ctx.fillText("Documento emitido por Remanente. No es una certificación ambiental oficial.", 90, 1312);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No pudimos crear la imagen."))), "image/png");
  });
}
