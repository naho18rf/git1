import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { AuthLayout, Field, formErrorClass } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/lib/auth";
import { nuevaPasswordSchema } from "@/lib/validation";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña · Remanente" },
      { name: "description", content: "Crea una nueva contraseña para tu cuenta de Remanente." },
      { property: "og:title", content: "Nueva contraseña · Remanente" },
      { property: "og:description", content: "Restablece la contraseña de tu cuenta de empresa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<"verificando" | "listo" | "invalido">("verificando");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo se habilita al llegar desde el enlace de recuperación del correo.
    const esRecuperacion = window.location.hash.includes("type=recovery");
    let listo = false;
    const marcarListo = () => {
      listo = true;
      setEstado("listo");
    };
    const recuperacionReciente = (iso?: string) =>
      !!iso && Date.now() - new Date(iso).getTime() < 60 * 60 * 1000;

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (esRecuperacion && session)) marcarListo();
    });
    supabase.auth.getSession().then(({ data: s }) => {
      const user = s.session?.user;
      if (user && (esRecuperacion || recuperacionReciente(user.recovery_sent_at))) marcarListo();
    });
    const t = window.setTimeout(() => {
      if (!listo) setEstado("invalido");
    }, esRecuperacion ? 8000 : 2500);
    return () => {
      window.clearTimeout(t);
      data.subscription.unsubscribe();
    };
  }, []);

  const form = useForm<z.infer<typeof nuevaPasswordSchema>>({
    resolver: zodResolver(nuevaPasswordSchema),
    defaultValues: { password: "", confirmacion: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(authErrorMessage(error.message));
      return;
    }
    toast.success("Contraseña actualizada");
    navigate({ to: "/panel", replace: true });
  });

  return (
    <AuthLayout eyebrow="Recuperar acceso" title="Crea una nueva contraseña">
      {estado === "verificando" && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Verificando enlace…
        </p>
      )}
      {estado === "invalido" && (
        <div className="surface-card p-8">
          <p className="text-foreground">Este enlace no es válido o ya expiró.</p>
          <Button className="mt-6" asChild>
            <Link to="/recuperar">Solicitar un nuevo enlace</Link>
          </Button>
        </div>
      )}
      {estado === "listo" && (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Field id="password" label="Nueva contraseña" error={errors.password?.message} hint="Mínimo 8 caracteres">
            <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...form.register("password")} />
          </Field>
          <Field id="confirmacion" label="Confirmar contraseña" error={errors.confirmacion?.message}>
            <Input id="confirmacion" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmacion} {...form.register("confirmacion")} />
          </Field>
          {error && (
            <p className={formErrorClass} role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Guardar contraseña
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
