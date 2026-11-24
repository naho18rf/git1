import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signUp: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { signUp: mocks.signUp },
    from: mocks.from,
  },
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
  };
});

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, useAuth: () => ({ session: null, ready: true }) };
});

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id: string;
    checked: boolean;
    onCheckedChange: (value: boolean) => void;
  }) => (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(event) => onCheckedChange(event.target.checked)}
    />
  ),
}));

import { Route as RegistroRoute } from "@/routes/registro";
import { Route as PerfilRoute } from "@/routes/_authenticated/panel/perfil";

const RegistroPage = RegistroRoute.options.component!;
const PerfilPage = PerfilRoute.options.component!;

const userId = "7e20a222-f63f-4f0f-9479-e58a946bc238";
const datos = {
  nombre_empresa: "Textiles del Sur SAC",
  ruc: "20601234567",
  representante: "María Torres",
  telefono: "987654321",
  distrito: "Lince",
  direccion: "Av. Arequipa 1234",
};

let empresaGuardada: Record<string, string | null> | null;

describe("Persistencia del registro de empresa", () => {
  beforeEach(() => {
    empresaGuardada = null;
    mocks.navigate.mockReset();
    mocks.signUp.mockReset().mockImplementation(async ({ email, options }) => {
      // Simula el disparador de la base: crea la empresa con el usuario y los metadatos del registro.
      empresaGuardada = { id: userId, correo: email, ...options.data };
      return { data: { user: null, session: null }, error: null };
    });
    mocks.from.mockReset().mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: empresaGuardada, error: null }),
        }),
      }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("mantiene los datos después de registrar la empresa y cambiar de sección", async () => {
    const registro = render(<RegistroPage />);
    fireEvent.change(screen.getByLabelText("Nombre de la empresa"), {
      target: { value: datos.nombre_empresa },
    });
    fireEvent.change(screen.getByLabelText("RUC"), { target: { value: datos.ruc } });
    fireEvent.change(screen.getByLabelText("Nombre del representante"), {
      target: { value: datos.representante },
    });
    fireEvent.change(screen.getByLabelText("Teléfono / WhatsApp"), {
      target: { value: datos.telefono },
    });
    fireEvent.change(screen.getByLabelText("Distrito"), { target: { value: datos.distrito } });
    fireEvent.change(screen.getByLabelText("Dirección"), { target: { value: datos.direccion } });
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "registro@empresa.pe" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "claveSegura1" } });
    fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
      target: { value: "claveSegura1" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta de empresa" }));

    await screen.findByRole("heading", { name: "Revisa tu correo" });
    expect(empresaGuardada).toMatchObject({ id: userId, ...datos, telefono: "+51987654321" });
    registro.unmount();

    vi.spyOn(PerfilRoute, "useRouteContext").mockReturnValue({
      user: { id: userId, email: "registro@empresa.pe" },
    } as never);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const vista = render(
      <QueryClientProvider client={queryClient}>
        <PerfilPage />
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Nombre de la empresa")).toHaveValue(datos.nombre_empresa),
    );

    vista.rerender(
      <QueryClientProvider client={queryClient}>
        <section>Otra sección del panel</section>
      </QueryClientProvider>,
    );
    expect(screen.getByText("Otra sección del panel")).toBeInTheDocument();

    vista.rerender(
      <QueryClientProvider client={queryClient}>
        <PerfilPage />
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Nombre de la empresa")).toHaveValue(datos.nombre_empresa),
    );
    expect(screen.getByLabelText("RUC")).toHaveValue(datos.ruc);
    expect(screen.getByLabelText("Representante")).toHaveValue(datos.representante);
    expect(screen.getByLabelText("Teléfono / WhatsApp")).toHaveValue("+51987654321");
    expect(screen.getByLabelText("Distrito")).toHaveValue(datos.distrito);
    expect(screen.getByLabelText("Dirección")).toHaveValue(datos.direccion);
  });

  it("muestra un error claro si no existe el registro de la empresa", async () => {
    vi.spyOn(PerfilRoute, "useRouteContext").mockReturnValue({
      user: { id: userId, email: "registro@empresa.pe" },
    } as never);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <PerfilPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No encontramos el registro de tu empresa",
    );
  });
});
