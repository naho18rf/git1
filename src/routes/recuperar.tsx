import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthLayout, Field, formErrorClass } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/lib/auth";

const schema = z.object({ correo: z.string().trim().email({ message: "Ingresa un correo válido" }) });

export const Route = createFileRoute("/recuperar")({
  head: () => ({
    meta: [
      { title: "Recuperar contraseña · Remanente" },
      { name: "description", content: "Recibe un enlace para restablecer tu contraseña de Remanente." },
      { property: "og:title", content: "Recuperar contraseña · Remanente" },
      { property: "og:description", content: "Restablece el acceso a la cuenta de tu empresa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecuperarPage,
});

function RecuperarPage() {
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { correo: "" } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ correo }) => {
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(authErrorMessage(error.message));
      return;
    }
    setEnviado(true);
  });

  return (
    <AuthLayout
      eyebrow="Recuperar acceso"
      title="¿Olvidaste tu contraseña?"
      subtitle="Te enviaremos un enlace para crear una nueva."
    >
      {enviado ? (
        <div className="rounded-lg border border-primary/20 bg-mint p-7 md:p-8">
          <MailCheck className="h-6 w-6 text-primary" strokeWidth={1.25} aria-hidden="true" />
          <p className="mt-4 text-primary-deep">
            Si el correo está registrado, recibirás un enlace en unos minutos.
          </p>
          <p className="mt-2 text-sm text-foreground">Revisa también la carpeta de spam.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Field id="correo" label="Correo" error={errors.correo?.message}>
            <Input id="correo" type="email" autoComplete="email" aria-invalid={!!errors.correo} {...form.register("correo")} />
          </Field>
          {error && (
            <p className={formErrorClass} role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Enviar enlace
          </Button>
        </form>
      )}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/auth" className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline">
          Volver a ingresar
        </Link>
      </p>
    </AuthLayout>
  );
}
