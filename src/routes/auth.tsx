import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AuthLayout, Field, formErrorClass } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage, useAuth } from "@/lib/auth";
import { loginSchema, safeRedirect } from "@/lib/validation";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  head: () => ({
    meta: [
      { title: "Ingresar · Remanente" },
      { name: "description", content: "Ingresa a tu cuenta de empresa en Remanente." },
      { property: "og:title", content: "Ingresar · Remanente" },
      { property: "og:description", content: "Ingresa a tu cuenta de empresa en Remanente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { session, ready } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const destino = safeRedirect(redirect);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: "", password: "" },
  });

  // Si ya hay sesión (o llega tras confirmar el correo), entrar al panel.
  useEffect(() => {
    if (ready && session) navigate({ to: destino, replace: true });
  }, [ready, session, destino, navigate]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.correo,
      password: values.password,
    });
    if (error) setError(authErrorMessage(error.message));
  });

  const { errors, isSubmitting } = form.formState;

  return (
    <AuthLayout
      eyebrow="Ingresar"
      title="Bienvenida de vuelta"
      subtitle="Accede con el correo de tu empresa."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field id="correo" label="Correo" error={errors.correo?.message}>
          <Input id="correo" type="email" autoComplete="email" aria-invalid={!!errors.correo} {...form.register("correo")} />
        </Field>
        <Field id="password" label="Contraseña" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...form.register("password")} />
        </Field>
        <div className="flex justify-end">
          <Link to="/recuperar" className="inline-flex min-h-11 items-center text-sm text-primary underline-offset-4 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        {error && (
          <p className={formErrorClass} role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Ingresar
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        ¿Tu empresa aún no tiene cuenta?{" "}
        <Link to="/registro" className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline">
          Registrar empresa
        </Link>
      </p>
    </AuthLayout>
  );
}
