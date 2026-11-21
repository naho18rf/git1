import { createFileRoute } from "@tanstack/react-router";

import { DraftNotice, SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos y condiciones · Remanente" },
      { name: "description", content: "Condiciones de uso de la plataforma Remanente para empresas." },
      { property: "og:title", content: "Términos y condiciones · Remanente" },
      { property: "og:description", content: "Condiciones de uso de la plataforma Remanente." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <SimplePage eyebrow="Legal" title="Términos y condiciones">
      <DraftNotice />
      <section>
        <h2>Sobre Remanente</h2>
        <p>
          Remanente es una plataforma que facilita el contacto entre empresas de Lima y Callao que
          generan residuos industriales y empresas que pueden reutilizarlos como materia prima.
        </p>
      </section>
      <section>
        <h2>Cuentas de empresa</h2>
        <p>
          La cuenta debe registrarse con datos reales de la empresa y su representante. Una misma
          cuenta puede publicar y adquirir materiales. La empresa es responsable de mantener la
          confidencialidad de su contraseña.
        </p>
      </section>
      <section>
        <h2>Responsabilidad sobre los materiales</h2>
        <p>
          Cada empresa es responsable de la descripción, estado, manipulación, transporte y uso de
          los materiales que publica o adquiere, así como del cumplimiento de la normativa aplicable.
        </p>
      </section>
      <section>
        <h2>Documentos emitidos</h2>
        <p>
          Los pasaportes de lote y certificados de entrega son documentos emitidos por Remanente.
          No constituyen una certificación ambiental oficial.
        </p>
      </section>
    </SimplePage>
  ),
});
