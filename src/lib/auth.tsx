import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  session: Session | null;
  ready: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, ready: false });

/** Único listener de sesión de la app. Mantiene el encabezado y las rutas al día. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({ session: null, ready: false });

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ session: data.session, ready: true });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ session, ready: true });
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [router, queryClient]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }, [queryClient, navigate]);
}

/** Traduce los errores más comunes del servicio de autenticación. */
export function authErrorMessage(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed"))
    return "Aún no confirmas tu correo. Revisa tu bandeja de entrada (y spam).";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ya existe una cuenta con este correo. Intenta ingresar o recuperar tu contraseña.";
  if (m.includes("password") && (m.includes("weak") || m.includes("pwned") || m.includes("leaked")))
    return "Esta contraseña es poco segura. Elige otra más difícil de adivinar.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
  if (m.includes("same password")) return "La nueva contraseña debe ser distinta a la anterior.";
  return "No pudimos completar la operación. Inténtalo nuevamente.";
}
