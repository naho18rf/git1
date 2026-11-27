# ZIP 0B · Portada: sin CO₂e/agua y sin el texto fijo "Aún no hay lotes"

**Aplícalo DESPUÉS del ZIP 1.** Este `src/routes/index.tsx` ya incluye el cambio del ZIP 1
(el botón "Sube una foto de tu merma" lleva a Analizar merma o al registro). Reemplaza al del ZIP 1.

## Qué cambia
- La sección Impacto muestra solo kg desviados y operaciones completadas, con una nota honesta sobre
  CO₂e y agua (hoy valen 0 en la base y nada los calcula).
- La sección Mercado ya no afirma "Aún no hay lotes publicados" (era texto fijo, aunque hubiera lotes):
  ahora invita a ver el mercado (`/mercado`) o a registrarse.

## Cómo integrarlo
1. Copia `src/routes/index.tsx` a su misma ruta (reemplaza el existente).
2. `npm test`, `npm run build` (o deja que Lovable compile).

## No verificado
No pude compilar ni ver la página en el navegador. Parte del archivo del ZIP 1 y solo cambia
las secciones Impacto y Mercado y los imports (se quitaron `Droplets` y `Wind`, que ya no se usan).
