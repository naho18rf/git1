import { createFileRoute } from "@tanstack/react-router";

import { DraftNotice, SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Privacidad · Remanente" },
      { name: "description", content: "Cómo Remanente trata los datos de las empresas registradas." },
      { property: "og:title", content: "Privacidad · Remanente" },
      { property: "og:description", content: "Política de privacidad de Remanente." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <SimplePage eyebrow="Legal" title="Política de privacidad">
      <DraftNotice />
      <section>
        <h2>Datos que recopilamos</h2>
        <p>
          Nombre de la empresa, RUC, nombre del representante, correo, teléfono, distrito y
          dirección, proporcionados al registrarse.
        </p>
      </section>
      <section>
        <h2>Para qué los usamos</h2>
        <p>
          Para gestionar tu cuenta, facilitar el contacto entre empresas y emitir documentos de
          las operaciones realizadas en la plataforma.
        </p>
      </section>
      <section>
        <h2>Quién puede verlos</h2>
        <p>
          Cada empresa solo puede ver y editar sus propios datos. Tienes derecho a acceder,
          rectificar y solicitar la eliminación de tu información conforme a la Ley N.° 29733 de
          Protección de Datos Personales.
        </p>
      </section>
    </SimplePage>
  ),
});
