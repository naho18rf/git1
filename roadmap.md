# Remanente — roadmap

## Hecho (iteración 1)
- [x] Portada con 5 secciones y contadores de impacto reales
- [x] Registro de empresa, verificación de correo, ingreso, recuperación, cierre de sesión
- [x] Área privada con panel, perfil editable y secciones "Próximamente"

## En curso
- [ ] Corregir el ícono del logo y aplicar la nueva dirección visual con Fraunces y Manrope
- [ ] Crear el flujo animado y la rosa interactiva de la portada
- [ ] Revisar responsive, movimiento reducido, tests y compilación

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

## Próximo
- [ ] Analizar merma con IA (foto → ficha sugerida)
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
