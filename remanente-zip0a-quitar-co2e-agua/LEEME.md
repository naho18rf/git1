# ZIP 0A · Quitar CO₂e y agua (hasta tener factores con fuente)

Independiente de los demás ZIP. Se puede aplicar antes o después.

## Por qué
En la base de datos, `co2e_evitado_kg` y `agua_ahorrada_l` valen 0 y ninguna función los calcula
(al completar un trato solo se guarda `kg_desviados`). La app los mostraba como "estimado" y decía que
crecen con cada entrega: nunca iban a crecer.

## Cómo integrarlo
Copia estos 2 archivos a sus mismas rutas (reemplazan los existentes):
- `src/routes/_authenticated/panel/impacto.tsx`
- `src/lib/reporte-pdf.ts`

Luego ejecuta `npm test` y `npm run build` (o deja que Lovable compile al sincronizar).

## Aún falta (a mano o con el ZIP 0B)
- `src/routes/index.tsx` (portada): lo trae el ZIP 0B.
- Opcional: en `src/components/panel/nav.ts`, la descripción de Impacto dice "Tus kg desviados, CO₂e y agua estimados."
  Cámbiala por "Tus kg desviados y operaciones completadas." (una línea).

## No verificado
No pude compilar ni correr las pruebas. Los cambios solo quitan elementos y texto.
