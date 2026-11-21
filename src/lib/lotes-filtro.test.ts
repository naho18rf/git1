import { describe, expect, it } from "vitest";

import { filtrarLotes, hayFiltroActivo, opcionesFiltro, SIN_FILTRO } from "./lotes-filtro";

const lotes = [
  { categoria: "textil", distrito: "Ate" },
  { categoria: "textil", distrito: "Callao" },
  { categoria: "madera", distrito: "Ate" },
];

describe("filtrarLotes", () => {
  it("devuelve todos los lotes cuando no hay filtros", () => {
    expect(filtrarLotes(lotes, { categoria: SIN_FILTRO, distrito: SIN_FILTRO })).toHaveLength(3);
  });

  it("filtra por categoría", () => {
    expect(filtrarLotes(lotes, { categoria: "textil", distrito: SIN_FILTRO })).toHaveLength(2);
  });

  it("filtra por categoría y distrito a la vez", () => {
    expect(filtrarLotes(lotes, { categoria: "madera", distrito: "Ate" })).toEqual([
      { categoria: "madera", distrito: "Ate" },
    ]);
  });

  it("devuelve una lista vacía si ningún lote cumple ambos filtros", () => {
    expect(filtrarLotes(lotes, { categoria: "madera", distrito: "Callao" })).toEqual([]);
  });
});

describe("opcionesFiltro", () => {
  it("lista las opciones sin duplicados y en orden alfabético", () => {
    expect(opcionesFiltro(lotes)).toEqual({
      categorias: ["madera", "textil"],
      distritos: ["Ate", "Callao"],
    });
  });
});

describe("hayFiltroActivo", () => {
  it("es falso cuando ambos filtros están vacíos", () => {
    expect(hayFiltroActivo({ categoria: SIN_FILTRO, distrito: SIN_FILTRO })).toBe(false);
  });

  it("es verdadero si basta con que uno de los dos esté elegido", () => {
    expect(hayFiltroActivo({ categoria: "textil", distrito: SIN_FILTRO })).toBe(true);
  });
});
