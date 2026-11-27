import { createFileRoute, Link } from "@tanstack/react-router";

import { DraftNotice, SimplePage } from "@/components/site/SimplePage";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Privacidad · Remanente" },
      {
        name: "description",
        content: "Cómo Remanente trata los datos de las empresas registradas.",
      },
      { property: "og:title", content: "Privacidad · Remanente" },
      { property: "og:description", content: "Política de privacidad de Remanente." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacidad,
});

const lista = "mt-3 list-disc space-y-2 pl-5 text-muted-foreground";

function Privacidad() {
  const correo = LEGAL.correoDatos.trim();
  return (
    <SimplePage
      eyebrow="Legal"
      title="Política de privacidad"
      intro={`Última actualización: ${LEGAL.actualizado}.`}
    >
      <DraftNotice />

      <section>
        <h2>1. Quién es responsable</h2>
        <p>
          El tratamiento de tus datos lo realiza {LEGAL.titular}. Esta política se basa en la Ley
          N.° 29733, Ley de Protección de Datos Personales, y su reglamento (Decreto Supremo N.°
          016-2024-JUS).
        </p>
      </section>

      <section>
        <h2>2. Qué datos tratamos</h2>
        <ul className={lista}>
          <li>
            <strong>Al registrarte:</strong> nombre de la empresa, RUC, nombre del representante,
            correo, teléfono o WhatsApp, distrito, dirección y tu contraseña (guardada de forma
            cifrada por el servicio de acceso, nunca en texto visible).
          </li>
          <li>
            <strong>Al publicar un lote:</strong> categoría, descripción, peso, empaque, distrito y
            fotos del material.
          </li>
          <li>
            <strong>Al analizar tu merma:</strong> las fotos que subes y la ficha que sugiere la IA,
            que se guardan en un historial privado de tu empresa.
          </li>
          <li>
            <strong>En tus tratos:</strong> solicitudes, mensajes, estados, constancias y avisos
            dentro de la plataforma.
          </li>
          <li>
            <strong>Con el asistente:</strong> tus conversaciones se guardan asociadas a tu empresa.
            En las páginas públicas, el asistente no guarda la conversación.
          </li>
          <li>
            <strong>Dato opcional:</strong> si tu empresa está dirigida por una mujer (sí, no o
            prefiero no decir). Responder no es obligatorio.
          </li>
          <li>
            <strong>Datos técnicos:</strong> información de tu sesión y reportes de errores técnicos
            para que la plataforma funcione.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Para qué los usamos</h2>
        <ul className={lista}>
          <li>Crear y proteger tu cuenta.</li>
          <li>Mostrar tus lotes y conectar a las empresas que acuerdan un trato.</li>
          <li>Emitir pasaportes de lote y constancias de entrega verificables.</li>
          <li>Sugerir fichas de material con IA y responder tus dudas con el asistente.</li>
          <li>Revisar lotes, atender reportes y resolver entregas con problema.</li>
          <li>Calcular cifras de impacto agregadas de la plataforma.</li>
        </ul>
        <p>No vendemos tus datos ni los usamos para publicidad.</p>
      </section>

      <section>
        <h2>4. Quién ve qué</h2>
        <ul className={lista}>
          <li>
            <strong>Cualquier persona:</strong> en el mercado y en el pasaporte de un lote se ven el
            nombre comercial de la empresa, el distrito, la categoría, el peso, la descripción y las
            fotos del lote. La verificación de una constancia muestra sus datos básicos, sin
            contacto.
          </li>
          <li>
            <strong>Otra empresa antes de aceptar el trato:</strong> solo el nombre comercial. No ve
            tu teléfono, correo ni representante.
          </li>
          <li>
            <strong>Otra empresa después de aceptar el trato:</strong> el representante, el teléfono
            o WhatsApp y el correo, únicamente de la empresa con la que tienes ese trato.
          </li>
          <li>
            <strong>Solo tu empresa:</strong> el historial de análisis, tus fotos de análisis y tus
            conversaciones con el asistente.
          </li>
          <li>
            <strong>Equipo administrador:</strong> lo necesario para revisar lotes, atender reportes
            y resolver problemas de entrega.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. IA y proveedores</h2>
        <p>
          Para funcionar usamos proveedores de alojamiento, base de datos e inteligencia artificial.
          Cuando usas Analizar merma o el asistente, el contenido que envías (por ejemplo, tus fotos
          y mensajes) se procesa con un modelo de IA de un proveedor externo. Estos proveedores
          pueden estar ubicados fuera del Perú. Evita subir fotos con personas, documentos o datos
          sensibles.
        </p>
        <p>
          Si decides escribir por WhatsApp a otra empresa, esa conversación ocurre en WhatsApp y se
          rige por sus propias políticas.
        </p>
      </section>

      <section>
        <h2>6. Dato de liderazgo femenino</h2>
        <p>
          Es opcional y puedes cambiarlo o quitarlo cuando quieras en Mi perfil. Solo se usa para
          una cifra agregada de toda la plataforma, calculada con quienes respondieron. Nunca se
          muestra la respuesta de una empresa en particular.
        </p>
      </section>

      <section>
        <h2>7. Cuánto tiempo los conservamos</h2>
        <p>
          Mantenemos tus datos mientras tu cuenta esté activa. Si pides eliminarla, borramos o
          anonimizamos tus datos, salvo los que formen parte de una constancia ya emitida o que
          debamos conservar para resolver reclamos o cumplir la ley. Los datos de una constancia se
          guardan como parte del documento para que pueda seguir verificándose.
        </p>
      </section>

      <section>
        <h2>8. Seguridad</h2>
        <p>
          Cada empresa solo puede leer y editar sus propios datos, las fotos de análisis son
          privadas y las fotos de lotes se muestran con enlaces que caducan. Ningún sistema es
          infalible: si ocurre un incidente que afecte tus datos, actuaremos y avisaremos según lo
          que exija la norma.
        </p>
      </section>

      <section>
        <h2>9. Tus derechos</h2>
        <p>
          Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su tratamiento
          (derechos ARCO), y también retirar tu consentimiento. Para ejercerlos, escríbenos{" "}
          {correo ? (
            <>
              a{" "}
              <a href={`mailto:${correo}`} className="text-primary underline underline-offset-4">
                {correo}
              </a>
            </>
          ) : (
            <>
              desde la página de{" "}
              <Link to="/contacto" className="text-primary underline underline-offset-4">
                contacto
              </Link>
            </>
          )}
          , indicando qué derecho quieres ejercer y con qué cuenta. Si crees que no atendimos tu
          solicitud, puedes presentar un reclamo ante la Autoridad Nacional de Protección de Datos
          Personales del Ministerio de Justicia y Derechos Humanos.
        </p>
      </section>

      <section>
        <h2>10. Sesión y almacenamiento del navegador</h2>
        <p>
          Usamos el almacenamiento de tu navegador para mantener tu sesión iniciada. No usamos
          publicidad ni herramientas de seguimiento de terceros.
        </p>
      </section>

      <section>
        <h2>11. Cambios</h2>
        <p>
          Si actualizamos esta política, cambiaremos la fecha de arriba y, si el cambio es
          importante, te lo avisaremos en la plataforma. Las condiciones de uso están en los{" "}
          <Link to="/terminos" className="text-primary underline underline-offset-4">
            términos y condiciones
          </Link>
          .
        </p>
      </section>
    </SimplePage>
  );
}
