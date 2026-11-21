import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Field, selectClass } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { empresaQuery } from "@/lib/empresa";
import { DISTRITOS_CALLAO, DISTRITOS_LIMA } from "@/lib/peru";
import { normalizePeruPhone, perfilSchema, type PerfilValues } from "@/lib/validation";

export const Route = createFileRoute("/_authenticated/panel/perfil")({
  head: () => ({ meta: [{ title: "Mi perfil · Remanente" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const { data: empresa, isLoading, isError } = useQuery(empresaQuery(user.id));

  const form = useForm<PerfilValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nombre_empresa: "", ruc: "", representante: "", telefono: "", distrito: "", direccion: "" },
  });
  const { errors, isSubmitting, isDirty } = form.formState;

  useEffect(() => {
    if (empresa) {
      form.reset({
        nombre_empresa: empresa.nombre_empresa ?? "",
        ruc: empresa.ruc ?? "",
        representante: empresa.representante ?? "",
        telefono: empresa.telefono ?? "",
        distrito: empresa.distrito ?? "",
        direccion: empresa.direccion ?? "",
      });
    }
  }, [empresa, form]);

  const onSubmit = form.handleSubmit(async (v) => {
    const { error } = await supabase
      .from("empresas")
      .update({ ...v, telefono: normalizePeruPhone(v.telefono) })
      .eq("id", user.id);
    if (error) {
      toast.error("No pudimos guardar los cambios. Inténtalo de nuevo.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["empresa", user.id] });
    toast.success("Datos de la empresa actualizados");
  });

  const reg = (name: keyof PerfilValues) => ({ id: name, "aria-invalid": !!errors[name], ...form.register(name) });

  return (
    <div>
      <h1 className="text-title text-primary-deep">Datos de tu empresa</h1>
      <p className="measure mt-3 text-[17px] text-muted-foreground">Solo tu empresa puede ver y editar esta información.</p>

      {isLoading ? (
        <p className="mt-10 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
        </p>
      ) : isError ? (
        <p className="mt-10 rounded-md border border-destructive/40 bg-surface px-4 py-3 text-sm text-destructive" role="alert">
          No pudimos cargar tus datos. Recarga la página.
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="surface-card mt-10 grid gap-5 p-7 sm:grid-cols-2 md:p-10">
          <Field id="nombre_empresa" label="Nombre de la empresa" error={errors.nombre_empresa?.message} className="sm:col-span-2">
            <Input {...reg("nombre_empresa")} />
          </Field>
          <Field id="ruc" label="RUC" error={errors.ruc?.message} hint="11 dígitos">
            <Input inputMode="numeric" maxLength={11} {...reg("ruc")} />
          </Field>
          <Field id="representante" label="Representante" error={errors.representante?.message}>
            <Input {...reg("representante")} />
          </Field>
          <Field id="correo" label="Correo" hint="El correo de acceso no se puede cambiar aquí.">
            <Input id="correo" value={user.email ?? ""} disabled readOnly />
          </Field>
          <Field id="telefono" label="Teléfono / WhatsApp" error={errors.telefono?.message}>
            <Input type="tel" {...reg("telefono")} />
          </Field>
          <Field id="distrito" label="Distrito" error={errors.distrito?.message}>
            <select className={selectClass} {...reg("distrito")}>
              <option value="">Elige un distrito</option>
              <optgroup label="Lima Metropolitana">
                {DISTRITOS_LIMA.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </optgroup>
              <optgroup label="Callao">
                {DISTRITOS_CALLAO.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </optgroup>
            </select>
          </Field>
          <Field id="direccion" label="Dirección" error={errors.direccion?.message}>
            <Input {...reg("direccion")} />
          </Field>
          <div className="flex justify-end border-t border-border pt-6 sm:col-span-2">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
