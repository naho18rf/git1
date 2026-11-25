import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { MapaEmpresasCercanas } from "./MapaEmpresasCercanas";

afterEach(cleanup);

it("selecciona la más cercana y cambia el destino al elegir otra empresa", () => {
  const { container } = render(<MapaEmpresasCercanas lotes={[
    { empresa_id: "ate", nombre_empresa: "Prueba Ate", distrito: "Ate", categoria: "textil" },
    { empresa_id: "centro", nombre_empresa: "Prueba Centro", distrito: "Cercado", categoria: "madera" },
  ]} />);
  expect(container.querySelector("iframe")?.getAttribute("src")).toContain("-12.048,-77.06");
  fireEvent.click(screen.getByRole("button", { name: /Prueba Ate/ }));
  expect(container.querySelector("iframe")?.getAttribute("src")).toContain("-12.0267,-76.9183");
  expect(screen.getByRole("link", { name: "Cómo llegar en Google Maps" }).getAttribute("href"))
    .toBe("https://www.google.com/maps/dir/?api=1&destination=-12.0267,-76.9183");
  fireEvent.click(screen.getByRole("button", { name: /^5 km$/ }));
  expect(screen.queryByRole("button", { name: /Prueba Ate/ })).toBeNull();
  expect(container.querySelector("iframe")?.getAttribute("src")).toContain("-12.048,-77.06");
});