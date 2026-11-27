# ZIP 4 · Modo demo (/demo)

Base: repo `naho18rf/git1`. Independiente de los otros ZIP.

## Qué es
Una página pública, `/demo`, que recorre el flujo completo en 5 pasos con **datos ficticios**
y un aviso visible de "Demostración". No toca la base de datos: no crea empresas, lotes ni cifras
reales, así que no contamina el Impacto ni el Mercado. Funciona aunque falle la red o la IA.

1. **Foto y ficha con IA**: ejemplo de la ficha que devuelve el análisis (con la misma forma que valida el análisis real; hay una prueba que lo comprueba).
2. **Lote publicado**: cómo se ve en el mercado.
3. **Solicitud y contacto**: botón "Aceptar solicitud" que muestra cómo los datos de contacto están ocultos hasta aceptar el trato.
4. **Entrega y constancia**: la huella SHA-256 se calcula en vivo; si cambias el peso, la verificación falla. Es la forma más clara de mostrar que la constancia no se puede alterar.
5. **Impacto**: solo kg y operaciones. El CO₂e y el agua no se muestran hasta tener factores con fuente.

## Cómo integrarlo
1. Descomprime en la raíz del repo.
2. `src/routeTree.gen.ts` es un archivo generado que ahora incluye `/demo`. Si tu versión cambió y hay conflicto, no lo reemplaces: ejecuta `npm run dev` una vez y se regenera solo (o `git apply routeTree.patch`).
3. `npm test`, `npm run build`, `git commit`. Abre `/demo`.

No hay enlace a /demo en el menú ni en el pie de página, a propósito: es para que tú la abras en la sala. Si quieres un enlace, dímelo.

## Verificado
`tsc --noEmit` sin errores, 113 pruebas pasan (110 + 3 nuevas), `vite build` compila. No lo vi en el navegador.
Las fotos son bloques de color (no hay fotos de stock), igual que el resto del sitio.

## Para el día de la demo
Esta página reemplaza datos de relleno, no la prueba real. Si puedes, muestra también un lote real tuyo con una constancia real.
