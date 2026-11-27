# ZIP 1B · Portada: arreglar el texto fijo "Aún no hay lotes publicados"

Reemplaza al `index.tsx` del ZIP 1 (ya incluye su cambio del botón "Sube una foto de tu merma").
**No uses el ZIP 0A ni el 0B**: ese enfoque quitaba el CO₂e y el agua, y ahora esas cifras se calculan
con factores citados (`src/lib/factores-impacto.ts`), así que ya no hace falta.

## Qué cambia (solo la sección Mercado)
Antes decía siempre "Aún no hay lotes publicados", aunque hubiera lotes. Ahora invita a ver el mercado
(`/mercado`) o a registrarse. La sección Impacto queda igual que en el ZIP 1.

## Cómo integrarlo
Copia `src/routes/index.tsx` a su misma ruta. No pude compilar ni abrir la página.
