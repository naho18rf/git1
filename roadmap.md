# Remanente — roadmap

## Hecho (iteración 1)

- [x] Portada con 5 secciones y contadores de impacto reales
- [x] Registro de empresa, verificación de correo, ingreso, recuperación, cierre de sesión
- [x] Área privada con panel, perfil editable y secciones "Próximamente"

## En curso

(nada abierto)

## Hecho (iteración 2)

- [x] Asistente de Remanente con IA: conversaciones múltiples guardadas por empresa, bienvenida y reglas de tono
- [x] Asistente también en páginas públicas (sin sesión, no se guarda; explica que vender/comprar requiere ingresar)

## Hecho (iteración 3)

- [x] Publicar lote: cámara dentro de la página, código de verificación, declaración y revisión
- [x] Cola de revisión para el equipo admin (aprobar o rechazar con motivo)
- [x] Pasaporte público del lote con QR, fotos y botón de reporte
- [x] Mercado público con filtros por categoría y distrito

## Hecho (iteración 4)

- [x] "Mis tratos" aparece en la barra lateral del panel (antes la página existía pero no tenía entrada)
- [x] "Solicitar este lote" en las fichas del mercado y en el pasaporte del lote; el diálogo se abre solo al llegar desde el mercado
- [x] El dueño de un lote no ve el botón sobre su propio lote (mercado y pasaporte)
- [x] Solicitud → aceptación → datos de contacto y WhatsApp probados de punta a punta con dos empresas de prueba (los datos se borraron después)

## Hecho (iteración 5 — Bloque 2A, parte final)

- [x] "Confirmar recepción" en la página del lote (la que abre el QR) para la empresa compradora, además de en "Mis tratos"
- [x] "Hay un problema con la entrega": aviso visible para ambas empresas y lista "Entregas con problema" para el equipo admin
- [x] Indicador de tratos pendientes en el menú del panel (escritorio y móvil)
- [x] La compradora ahora ve los datos del lote en sus tratos
- [x] Pruebas: entrega → completada / con problema, solo la compradora confirma, una constancia por trato, huella y verificación pública sin datos privados
- [x] Flujo completo probado con dos empresas de prueba (solicitar → aceptar → entregar → confirmar → constancia → PDF → verificación); datos borrados

## Hecho (iteración 6 — verificación del remix)

- [x] Dirección visual confirmada: Fraunces y Manrope cargan desde la cabecera y se usan en el panel de estilos
- [x] Flujo animado y pasos interactivos presentes en la portada
- [x] Responsive revisado en 390 y 768: sin desbordes horizontales; con movimiento reducido la app se ve igual de completa
- [x] El botón flotante del asistente ya no tapa el formulario de registro (se oculta en registro, ingreso, recuperación y cambio de clave)
- [x] El botón flotante se oculta mientras el pie de página está a la vista, para no tapar sus enlaces (probado en portada, mercado, contacto y pasaporte, en celular y escritorio)
- [x] Pruebas: 66 pasan. Compilación y typecheck: sin errores

## Hecho (iteración 7 — análisis con IA)

- [x] Analizar merma con IA: foto → ficha sugerida editable, sin estimar precios
- [x] Historial privado por empresa con fotos privadas y cambios guardados
- [x] Flujo real probado con foto de textiles: análisis, edición y persistencia tras recargar
- [x] Pruebas: 71 pasan

## Hecho (iteración 8 — registro, análisis y avisos)

- [x] Restaurado el guardado automático de empresas y recuperada la cuenta que no tenía fila; errores visibles si falta el registro
- [x] Prueba real y automatizada: registrar empresa → cambiar de sección → todos los datos siguen visibles
- [x] Analizar merma: hasta 3 fotos, categorías de Publicar lote, usos para Lima y Callao, limitaciones y avisos de manejo; ficha editable sin precios ni peso
- [x] Análisis real con 3 fotos verificado: categoría textil, confianza media, recomendaciones y limitaciones visibles
- [x] No hay correo de aplicación configurado: avisos internos al entrar en Mis tratos y contador sin duplicar eventos
- [x] Solicitudes, aceptación, rechazo, entrega, constancia y problema generan avisos únicos para las empresas y admin correspondientes
- [x] Verificados 13 avisos sin datos de contacto; contacto oculto antes de aceptar y completo después, con WhatsApp intacto
- [x] Pruebas: 77 pasan. Typecheck y lint de archivos modificados: sin errores

## Hecho (iteración 9 — dato opcional de liderazgo femenino)

- [x] Registro de empresa: campo opcional "¿Tu empresa está dirigida por una mujer?" (Sí / No / Prefiero no decir), guardado en la ficha
- [x] Mi perfil: la respuesta se puede cambiar en cualquier momento
- [x] Impacto del panel: "% de empresas dirigidas por mujeres" debajo de los totales, solo con quienes respondieron; "Aún sin datos" si nadie respondió
- [x] Verificado en el navegador: guardar → recargar → sigue ahí; la cifra sube a 100% con 1 respuesta y vuelve a "Aún sin datos" al quitarla
- [x] Pruebas: 99 pasan. Typecheck y compilación: sin errores

## Próximo

- [ ] Verificación de empresas con SUNAT
- [ ] Contrato en PDF
- [ ] Panel de impacto por empresa
- [ ] Mapa de simbiosis
- [ ] Admin (asignar rol admin y herramientas)
- [ ] Textos legales definitivos y datos de contacto reales (pendiente de la usuaria)

## Migración a este proyecto

- [x] Código, diseño, base de datos y registro de empresas trasladados y probados
- [ ] Importar datos existentes (empresas, roles, operaciones) — esperando exportación de la usuaria
- [ ] Importar usuarios existentes (id y correo) — esperando exportación de la usuaria
