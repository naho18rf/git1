import { createFileRoute, Link } from "@tanstack/react-router";

import { DraftNotice, SimplePage } from "@/components/site/SimplePage";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos y condiciones · Remanente" },
      {
        name: "description",
        content: "Condiciones de uso de la plataforma Remanente para empresas.",
      },
      { property: "og:title", content: "Términos y condiciones · Remanente" },
      { property: "og:description", content: "Condiciones de uso de la plataforma Remanente." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terminos,
});

const lista = "mt-3 list-disc space-y-2 pl-5 text-muted-foreground";

function Terminos() {
  return (
    <SimplePage
      eyebrow="Legal"
      title="Términos y condiciones"
      intro={`Última actualización: ${LEGAL.actualizado}.`}
    >
      <DraftNotice />

      <section>
        <h2>1. Qué es Remanente y qué no es</h2>
        <p>
          Remanente es una plataforma web que ayuda a empresas de Lima y Callao que generan residuos
          industriales (mermas) a encontrar empresas que pueden usarlos como materia prima. Lo opera{" "}
          {LEGAL.titular}.
        </p>
        <p>
          Remanente facilita el contacto y deja constancia de las entregas. No compra ni vende
          materiales, no transporta, no procesa pagos y no es parte de los acuerdos entre empresas.
          Hoy no cobra por usar la plataforma.
        </p>
      </section>

      <section>
        <h2>2. Cuentas de empresa</h2>
        <ul className={lista}>
          <li>
            La cuenta la crea una persona con facultades para representar a la empresa, con datos
            reales y vigentes. Dar información falsa es motivo de suspensión.
          </li>
          <li>Una misma cuenta puede publicar y también solicitar materiales.</li>
          <li>
            Tú eres responsable de tu contraseña y de lo que se haga con tu cuenta. Avísanos si
            sospechas un uso no autorizado.
          </li>
          <li>
            Las cuentas nuevas tienen límites de lotes y de solicitudes pendientes, que se liberan
            al completar el primer trato. Es una medida para cuidar la calidad del mercado.
          </li>
          <li>
            Por ahora Remanente valida el formato del RUC, pero no lo cruza con SUNAT. Que una
            empresa aparezca en la plataforma no significa que Remanente haya verificado su
            existencia legal.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Publicar un lote</h2>
        <ul className={lista}>
          <li>
            Publicas solo lo que es tuyo y puedes ceder. La descripción, el peso, el estado y las
            fotos deben ser verdaderos. Las fotos se toman dentro de la plataforma con un código de
            verificación.
          </li>
          <li>
            No se permiten materiales peligrosos o de manejo especial: pilas, baterías, aparatos
            electrónicos, químicos, aceites, solventes, pinturas, residuos médicos o
            biocontaminados, asbesto, inflamables, orgánicos frescos, neumáticos, vidrio roto y
            madera tratada o protegida sin documentos. La lista completa está en la pantalla de
            publicar.
          </li>
          <li>
            El equipo de Remanente revisa los lotes antes de mostrarlos. Puede rechazar o retirar un
            lote y, en ese caso, tú verás el motivo. Cualquier empresa registrada puede reportar un
            lote que parezca incorrecto o inseguro.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Solicitar un lote y cerrar un trato</h2>
        <p>El trato sigue estos pasos dentro de Mis tratos:</p>
        <ul className={lista}>
          <li>Una empresa solicita un lote publicado. Quien publicó decide si acepta o rechaza.</li>
          <li>
            Si se acepta, el lote queda reservado y se muestran los datos de contacto y el WhatsApp
            de ambas empresas. Antes de la aceptación, la otra empresa solo ve el nombre comercial.
          </li>
          <li>La empresa que entrega marca la entrega y la que recibe confirma la recepción.</li>
          <li>
            Al confirmar, se emite la constancia. Si algo salió mal, quien recibió puede reportar un
            problema y no se emite constancia hasta resolverlo.
          </li>
        </ul>
        <p>
          Usa los datos de contacto solo para concretar ese trato. No los uses para enviar
          publicidad ni los compartas con terceras personas. El precio, el transporte, el empaque y
          la forma de pago los acuerdan directamente las empresas; Remanente no interviene.
        </p>
      </section>

      <section>
        <h2>5. Pasaporte del lote y constancia de entrega</h2>
        <p>
          El pasaporte (con su código QR) y la constancia de entrega son documentos emitidos por
          Remanente. La constancia lleva un número y una huella digital que cualquier persona puede
          verificar en la página pública, sin ver datos de contacto. No son una certificación
          ambiental oficial ni reemplazan los documentos que exija la normativa de residuos sólidos.
        </p>
      </section>

      <section>
        <h2>6. Analizar merma con IA</h2>
        <p>
          La función de análisis usa inteligencia artificial para sugerir, a partir de tus fotos, el
          tipo de material, su estado visible, usos posibles y recomendaciones de manejo. Es una
          sugerencia: puede equivocarse, no es un peritaje y no estima precio ni peso. Tú revisas y
          editas todo antes de usarlo y eres responsable de lo que publiques. El asistente de
          Remanente también usa IA y sus respuestas son orientativas.
        </p>
      </section>

      <section>
        <h2>7. Tu responsabilidad sobre los materiales</h2>
        <p>
          Cada empresa responde por la descripción, el manejo, el almacenamiento, el transporte y el
          uso de los materiales que publica o recibe, y por cumplir la normativa aplicable, incluida
          la de residuos sólidos y la de seguridad. Remanente no garantiza la calidad, la cantidad
          ni la idoneidad de ningún material.
        </p>
      </section>

      <section>
        <h2>8. Planes y cobros</h2>
        <p>
          Los planes de pago aún no están activos. Si se activan, te avisaremos antes y no se
          cobrará nada sin tu aceptación expresa.
        </p>
      </section>

      <section>
        <h2>9. Conductas no permitidas</h2>
        <ul className={lista}>
          <li>Publicar información falsa, fotos ajenas o materiales no permitidos.</li>
          <li>Acosar, discriminar o faltar el respeto a otras personas usuarias o al equipo.</li>
          <li>Usar los datos de contacto de otras empresas para fines distintos al trato.</li>
          <li>Intentar vulnerar la seguridad de la plataforma o acceder a datos ajenos.</li>
        </ul>
        <p>
          Podemos suspender cuentas o retirar contenido que incumpla estos términos y, si
          corresponde, informar a las autoridades.
        </p>
      </section>

      <section>
        <h2>10. Disponibilidad y límites</h2>
        <p>
          Hacemos lo posible por mantener la plataforma disponible, pero puede tener interrupciones
          o errores. En lo permitido por la ley, Remanente no responde por pérdidas derivadas de los
          acuerdos entre empresas, de materiales que no coincidan con su descripción o del uso de
          las sugerencias de la IA.
        </p>
      </section>

      <section>
        <h2>11. Datos personales</h2>
        <p>
          Cómo tratamos tus datos está explicado en la{" "}
          <Link to="/privacidad" className="text-primary underline underline-offset-4">
            política de privacidad
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>12. Cambios, ley aplicable y contacto</h2>
        <p>
          Podemos actualizar estos términos; la fecha de arriba indica la última versión. Si el
          cambio es importante, te lo avisaremos en la plataforma. Estos términos se rigen por las
          leyes del Perú. Para dudas, escríbenos desde la página de{" "}
          <Link to="/contacto" className="text-primary underline underline-offset-4">
            contacto
          </Link>
          .
        </p>
      </section>
    </SimplePage>
  );
}
