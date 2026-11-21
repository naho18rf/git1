import { describe, expect, it } from "vitest";
import { accionesDisponibles, contactoVisible, contarPendientes, siguienteEstado, datosOtraEmpresa, enlaceWhatsApp, MAX_SOLICITUDES_PENDIENTES, puedeAccion, puedeSolicitar, puedeSolicitarLote, solicitarSchema } from "./tratos-reglas";

const empresa = { nombre_empresa: "Textiles SAC", representante: "Ana", telefono: "987654321", correo: "a@t.pe" };

describe("transiciones de trato", () => {
  it("la vendedora acepta o rechaza una solicitud", () => {
    expect(puedeAccion("solicitada", "aceptar", "vendedora")).toBe(true);
    expect(puedeAccion("solicitada", "rechazar", "vendedora")).toBe(true);
  });
  it("la compradora no puede aceptar su propia solicitud", () => {
    expect(puedeAccion("solicitada", "aceptar", "compradora")).toBe(false);
  });
  it("solo la vendedora marca entregado y solo si está aceptada", () => {
    expect(puedeAccion("aceptada", "entregar", "vendedora")).toBe(true);
    expect(puedeAccion("aceptada", "entregar", "compradora")).toBe(false);
    expect(puedeAccion("solicitada", "entregar", "vendedora")).toBe(false);
  });
  it("solo la compradora confirma recepción tras la entrega", () => {
    expect(puedeAccion("entregada", "confirmar", "compradora")).toBe(true);
    expect(puedeAccion("entregada", "confirmar", "vendedora")).toBe(false);
    expect(puedeAccion("aceptada", "confirmar", "compradora")).toBe(false);
  });
  it("no se puede cancelar después de entregar ni tocar tratos cerrados", () => {
    expect(puedeAccion("entregada", "cancelar", "compradora")).toBe(false);
    expect(accionesDisponibles("completada", "vendedora")).toEqual([]);
    expect(accionesDisponibles("rechazada", "compradora")).toEqual([]);
    expect(accionesDisponibles("con_problema", "compradora")).toEqual([]);
  });
});

describe("entrega y recepción", () => {
  it("al marcar la entrega, un trato aceptado pasa a entregada", () => {
    expect(siguienteEstado("aceptada", "entregar", "vendedora")).toBe("entregada");
  });
  it("al confirmar, un trato entregado pasa a completada", () => {
    expect(siguienteEstado("entregada", "confirmar", "compradora")).toBe("completada");
  });
  it("al avisar un problema, un trato entregado pasa a con_problema y no se completa", () => {
    expect(siguienteEstado("entregada", "problema", "compradora")).toBe("con_problema");
  });
  it("solo la compradora puede confirmar o avisar un problema", () => {
    expect(siguienteEstado("entregada", "confirmar", "vendedora")).toBeNull();
    expect(siguienteEstado("entregada", "problema", "vendedora")).toBeNull();
  });
  it("no se confirma un trato que aún no se entregó", () => {
    expect(siguienteEstado("solicitada", "confirmar", "compradora")).toBeNull();
    expect(siguienteEstado("aceptada", "problema", "compradora")).toBeNull();
  });
  it("la constancia se emite una sola vez: un trato completado ya no se puede confirmar", () => {
    expect(siguienteEstado("completada", "confirmar", "compradora")).toBeNull();
    expect(accionesDisponibles("completada", "compradora")).toEqual([]);
  });
  it("un trato con problema no se puede confirmar después", () => {
    expect(siguienteEstado("con_problema", "confirmar", "compradora")).toBeNull();
  });
});

describe("indicador de pendientes", () => {
  it("cuenta solo los tratos que esperan una acción tuya", () => {
    expect(contarPendientes([
      { estado: "solicitada", rol: "vendedora" }, // aceptar o rechazar
      { estado: "aceptada", rol: "vendedora" }, // marcar entregado
      { estado: "entregada", rol: "compradora" }, // confirmar recepción
      { estado: "solicitada", rol: "compradora" }, // espera a la vendedora
      { estado: "entregada", rol: "vendedora" }, // espera a la compradora
      { estado: "completada", rol: "compradora" },
    ])).toBe(3);
  });
  it("sin tratos no hay pendientes", () => {
    expect(contarPendientes([])).toBe(0);
  });
});

describe("límite de solicitudes", () => {
  it("una empresa nueva puede tener hasta 3 pendientes", () => {
    expect(MAX_SOLICITUDES_PENDIENTES).toBe(3);
    expect(puedeSolicitar({ tieneCompletado: false, pendientes: 2 })).toBe(true);
    expect(puedeSolicitar({ tieneCompletado: false, pendientes: 3 })).toBe(false);
  });
  it("con un trato completado ya no hay límite", () => {
    expect(puedeSolicitar({ tieneCompletado: true, pendientes: 10 })).toBe(true);
  });
  it("el mensaje admite máximo 300 caracteres", () => {
    const base = { loteId: "00000000-0000-4000-8000-000000000000", recogida: "Recogemos con nuestra movilidad" };
    expect(solicitarSchema.safeParse({ ...base, mensaje: "a".repeat(300) }).success).toBe(true);
    expect(solicitarSchema.safeParse({ ...base, mensaje: "a".repeat(301) }).success).toBe(false);
  });
});

describe("botón solicitar lote", () => {
  it("una empresa con sesión puede solicitar un lote publicado de otra", () => {
    expect(puedeSolicitarLote({ tieneSesion: true, esDueno: false, estado: "publicado" })).toBe(true);
  });
  it("nadie solicita su propio lote", () => {
    expect(puedeSolicitarLote({ tieneSesion: true, esDueno: true, estado: "publicado" })).toBe(false);
  });
  it("sin sesión no se solicita", () => {
    expect(puedeSolicitarLote({ tieneSesion: false, esDueno: false, estado: "publicado" })).toBe(false);
  });
  it("un lote que no está publicado no se puede solicitar", () => {
    expect(puedeSolicitarLote({ tieneSesion: true, esDueno: false, estado: "reservado" })).toBe(false);
    expect(puedeSolicitarLote({ tieneSesion: true, esDueno: false, estado: "en_revision" })).toBe(false);
  });
});

describe("datos de contacto", () => {
  it("no se exponen antes de aceptar", () => {
    for (const estado of ["solicitada", "rechazada", "cancelada"] as const) {
      expect(contactoVisible(estado)).toBe(false);
      const d = datosOtraEmpresa(estado, empresa);
      expect(d.telefono).toBeNull();
      expect(d.correo).toBeNull();
      expect(d.representante).toBeNull();
    }
  });
  it("se muestran a ambas partes después de aceptar", () => {
    expect(datosOtraEmpresa("aceptada", empresa).telefono).toBe("987654321");
    expect(enlaceWhatsApp("987 654 321")).toBe("https://wa.me/51987654321");
  });
});
