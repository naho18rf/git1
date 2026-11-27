# ZIP 1 · Menú, portada, mapa con datos reales y contacto

Base: repo `naho18rf/git1` (commit 81ca2b4). Todo en español, sin dependencias nuevas.

## Cómo integrarlo
1. Descomprime en la raíz del repo (las carpetas `src/...` se mezclan con las tuyas y reemplazan 5 archivos).
2. Borra `src/components/mapa/MapaSimbiosis.tsx`: ya nada lo usa y es el mapa con puntos inventados.
3. Abre `src/lib/contacto.ts` y completa `correo`, `whatsapp` y `horario` con los datos reales.
   Mientras estén vacíos, la página sigue diciendo "Nuestros canales se publicarán muy pronto".
4. `npm test`, `npm run build` y `git commit`.

Si ya modificaste `src/routes/index.tsx` o los otros 4 archivos existentes, no los reemplaces:
aplica `cambios-archivos-existentes.patch` con `git apply --3way cambios-archivos-existentes.patch`
o copia los cambios a mano (en `index.tsx` son solo 4 líneas).

## Qué cambia
| Archivo | Cambio |
|---|---|
| `src/components/panel/nav.ts` | Agrega **Analizar merma** (`/panel/analizar`) y **Mapa** (`/panel/mapa`) al menú y al inicio del panel. |
| `src/routes/index.tsx` | El botón "Sube una foto de tu merma" lleva a Analizar merma si hay sesión y a `/registro` si no. |
| `src/routes/_authenticated/panel/mapa.tsx` | El mapa usa los lotes publicados reales (el mismo componente del Mercado). Se quita el aviso "vista ilustrativa". |
| `src/lib/empresas-cercanas.ts` | Coordenadas para los **50 distritos** del registro (antes eran 6) y se arregla `Lima (Cercado)`, que no se reconocía. |
| `src/lib/contacto.ts` + `src/routes/contacto.tsx` | Contacto configurable: muestra solo los canales válidos. No inventa datos. |
| `src/lib/distritos-cobertura.test.ts`, `src/lib/contacto.test.ts` | 8 pruebas nuevas. |

## Por qué importa lo de los distritos
Antes, un lote publicado en Miraflores, Surco, La Molina, etc. no aparecía en el mapa
("lote sin ubicación distrital"), y "Lima (Cercado)" (el texto exacto del registro) tampoco.

## Verificado
- `tsc --noEmit` sin errores. `vitest`: 110 pruebas pasan (102 + 8 nuevas). `vite build` compila.
- Lint: los archivos nuevos quedan limpios. `index.tsx` y `empresas-cercanas.ts` ya tenían avisos de formato
  (prettier) antes de estos cambios; no los reformateé para no ensuciar el historial.

## No verificado (pruébalo tú)
- Navegación y mapa en el navegador con sesión y datos reales de Supabase.
- Las coordenadas de los 44 distritos nuevos son **centroides aproximados** (los 6 originales no se tocaron).
  Sirven como referencia visual; confírmalas si las vas a usar para algo más.
- Con el Mercado vacío, el mapa mostrará "Aún no hay empresas con lotes publicados". Publica 3 a 5 lotes reales antes de la demo.

## Pendiente para próximos ZIP
Textos legales completos, Impacto por empresa con factores citados, Reconocimientos, avisos por correo/WhatsApp.
