# ZIP 2 · Términos y condiciones y Política de privacidad

Base: repo `naho18rf/git1`. Independiente del ZIP 1 (se puede aplicar en cualquier orden).

## Cómo integrarlo
1. Descomprime en la raíz del repo: reemplaza `src/routes/terminos.tsx` y `src/routes/privacidad.tsx` y agrega `src/lib/legal.ts`.
2. Edita `src/lib/legal.ts`:
   - `titular`: hoy dice "el equipo fundador de Remanente, estudiantes de la UNI, mientras no esté constituido como empresa". Cuando exista una empresa, pon razón social y RUC.
   - `correoDatos`: un correo real para derechos sobre datos. Vacío = la página manda a /contacto.
3. `npm test`, `npm run build`, `git commit`.

## Qué dice y de dónde sale
Cada afirmación está contrastada con el código del repo:
- El contacto se revela solo en los estados aceptada, entregada, completada y con problema (`contactoVisible`). Antes, la otra empresa ve solo el nombre comercial.
- Qué es público: lo que devuelven `mercado_lotes` y `lote_publico`.
- Límites de cuenta nueva (3 lotes activos, se levantan con la primera entrega) y reportes solo de empresas registradas.
- La lista de materiales no permitidos sale de `MATERIALES_NO_PERMITIDOS`.
- IA: las fotos y mensajes se procesan con un modelo de un proveedor externo; no estima precio ni peso.
- Planes: cobros aún no activos. RUC: solo formato, sin SUNAT (se dice explícitamente).
- No se afirma nada que no se pudo ver en el código: no hay analítica ni publicidad de terceros (se buscó en `src` y `index.html`).

Marco legal citado: Ley N.° 29733 y su Reglamento, D.S. N.° 016-2024-JUS (publicado el 30/11/2024, vigente desde el 31/03/2025).

## Importante
- **Sigue siendo un borrador.** Se conserva el aviso "Debe ser revisado por asesoría legal". No lo quites hasta que alguien con formación legal lo revise.
- No se dice nada sobre plazos de conservación ni registro de bancos de datos ante la autoridad: no los conozco para tu caso. Pregúntalo al asesor.
- Si cambias el comportamiento del producto (por ejemplo, activas cobros o correos), actualiza el texto y la fecha en `legal.ts`.

## Verificado
`tsc --noEmit` sin errores, 110 pruebas pasan y `vite build` compila. No lo vi renderizado en el navegador.
