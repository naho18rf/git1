import { describe, expect, it } from "vitest";

import { fichaMermaSchema } from "./analisis-merma-reglas";
import { DEMO_FICHA, huellaDemo, huellaSha256 } from "./demo-datos";

describe("datos de demostración", () => {
  it("la ficha de ejemplo cumple el mismo esquema que el análisis real", () => {
    expect(fichaMermaSchema.safeParse(DEMO_FICHA).success).toBe(true);
  });

  it("SHA-256 coincide con el valor conocido", async () => {
    expect(await huellaSha256("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("la huella cambia si se altera un dato", async () => {
    expect(await huellaDemo(120)).toBe(await huellaDemo(120));
    expect(await huellaDemo(120)).not.toBe(await huellaDemo(121));
  });
});
