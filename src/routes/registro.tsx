import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { AuthLayout, Field, formErrorClass, selectClass } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage, useAuth } from "@/lib/auth";
import { DISTRITOS_CALLAO, DISTRITOS_LIMA } from "@/lib/peru";
import { normalizePeruPhone, registroSchema, type RegistroValues } from "@/lib/validation";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Registrar empresa · Remanente" },
      {
        name: "description",
        content: "Registra tu empresa en Remanente para publicar mermas y encontrar materia prima.",
      },
      { property: "og:title", content: "Registrar empresa · Remanente" },
      {
        property: "og:description",
        content: "Crea la cuenta de tu empresa: una misma cuenta puede comprar y vender.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const navigate = useNavigate();
  const { session, ready } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [enviadoA, setEnviadoA] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) navigate({ to: "/panel", replace: true });
  }, [ready, session, navigate]);

  const form = useForm<RegistroValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      nombre_empresa: "",
      ruc: "",
      representante: "",
      correo: "",
      password: "",
      confirmacion: "",
      telefono: "",
      distrito: "",
      direccion: "",
      acepta_terminos: false,
    },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (v) => {
    setError(null);
    const { error } = await supabase.auth.signUp({
      email: v.correo,
      password: v.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: {
          nombre_empresa: v.nombre_empresa,
          ruc: v.ruc,
          representante: v.representante,
          telefono: normalizePeruPhone(v.telefono),
          distrito: v.distrito,
          direccion: v.direccion,
          acepta_terminos: v.acepta_terminos,
        },
      },
    });
    if (error) {
      setError(authErrorMessage(error.message));
      return;
    }
    setEnviadoA(v.correo);
  });

  if (enviadoA) {
    return (
      <AuthLayout eyebrow="Registro" title="Revisa tu correo">
        <div className="rounded-lg border border-primary/20 bg-mint p-7 md:p-8">
          <MailCheck className="h-6 w-6 text-primary" strokeWidth={1.25} aria-hidden="true" />
          <p className="mt-4 text-primary-deep">
            Enviamos un enlace de confirmación a <strong className="font-medium">{enviadoA}</strong>.
          </p>
          <p className="mt-2 text-sm text-foreground">
            Ábrelo para activar la cuenta de tu empresa. Si no lo ves en unos minutos, revisa la
            carpeta de spam.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link to="/auth">Ir a ingresar</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  const reg = (name: keyof RegistroValues) => ({
    id: name,
    "aria-invalid": !!errors[name],
    ...form.register(name),
  });

  return (
    <AuthLayout
      wide
      eyebrow="Registrar empresa"
      title="Únete a Remanente"
      subtitle="Una misma cuenta de empresa puede publicar mermas y adquirir materiales."
    >
      <form onSubmit={onSubmit} className="space-y-10" noValidate>
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-5 font-display text-heading text-primary-deep">Empresa</legend>
          <Field id="nombre_empresa" label="Nombre de la empresa" error={errors.nombre_empresa?.message} className="sm:col-span-2">
            <Input autoComplete="organization" {...reg("nombre_empresa")} />
          </Field>
          <Field id="ruc" label="RUC" error={errors.ruc?.message} hint="11 dígitos">
            <Input inputMode="numeric" maxLength={11} {...reg("ruc")} />
          </Field>
          <Field id="representante" label="Nombre del representante" error={errors.representante?.message}>
            <Input autoComplete="name" {...reg("representante")} />
          </Field>
          <Field id="telefono" label="Teléfono / WhatsApp" error={errors.telefono?.message} hint="Ej.: 987 654 321">
            <Input type="tel" inputMode="tel" autoComplete="tel" {...reg("telefono")} />
          </Field>
          <Field id="distrito" label="Distrito" error={errors.distrito?.message}>
            <select className={selectClass} {...reg("distrito")}>
              <option value="">Elige un distrito</option>
              <optgroup label="Lima Metropolitana">
                {DISTRITOS_LIMA.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Callao">
                {DISTRITOS_CALLAO.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </optgroup>
            </select>
          </Field>
          <Field id="direccion" label="Dirección" error={errors.direccion?.message} className="sm:col-span-2">
            <Input autoComplete="street-address" {...reg("direccion")} />
          </Field>
        </fieldset>

        <hr className="border-border" />

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-5 font-display text-heading text-primary-deep">Acceso</legend>
          <Field id="correo" label="Correo" error={errors.correo?.message} className="sm:col-span-2">
            <Input type="email" autoComplete="email" {...reg("correo")} />
          </Field>
          <Field id="password" label="Contraseña" error={errors.password?.message} hint="Mínimo 8 caracteres">
            <Input type="password" autoComplete="new-password" {...reg("password")} />
          </Field>
          <Field id="confirmacion" label="Confirmar contraseña" error={errors.confirmacion?.message}>
            <Input type="password" autoComplete="new-password" {...reg("confirmacion")} />
          </Field>
        </fieldset>

        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <Controller
              control={form.control}
              name="acepta_terminos"
              render={({ field }) => (
                <Checkbox
                  id="acepta_terminos"
                  className="mt-0.5 h-5 w-5 rounded-[4px]"
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                  aria-invalid={!!errors.acepta_terminos}
                />
              )}
            />
            <label htmlFor="acepta_terminos" className="text-sm leading-relaxed text-muted-foreground">
              Acepto los{" "}
              <Link to="/terminos" target="_blank" className="text-primary underline-offset-4 hover:underline">
                términos y condiciones
              </Link>{" "}
              y la{" "}
              <Link to="/privacidad" target="_blank" className="text-primary underline-offset-4 hover:underline">
                política de privacidad
              </Link>
              .
            </label>
          </div>
          {errors.acepta_terminos && (
            <p className="text-sm text-destructive" role="alert">
              {errors.acepta_terminos.message}
            </p>
          )}
        </div>

        {error && (
          <p className={formErrorClass} role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/auth" className="font-medium text-primary underline-offset-4 hover:underline">
              Ingresar
            </Link>
          </p>
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Crear cuenta de empresa
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
