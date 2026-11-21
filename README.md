# Lima Circular Material Match

Crea REMANENTE: plataforma web B2B de economía circular para Lima y Callao (Perú) que conecta empresas que generan residuos industriales con empresas que pueden reutilizarlos como materia prima. Toda la interfaz en español. React + TypeScript + Tailwind + shadcn/ui, responsive (mobile-first).

SISTEMA DE DISEÑO (definir como tokens en Tailwind/CSS variables y usarlos en todo el proyecto):
- Colores: verde bosque #145C43 (primario), verde oscuro #0B382B, menta #DCEFE5, marfil #FBF7F2 (fondo general, no blanco puro), blanco #FFFFFF, rosa empolvado #F3DCD8, dorado rosado #C69A86, marrón rosado #8A5A4B (etiquetas), texto #2F4A40, texto secundario #5C7268, bordes #E8DDD3.
- Tipografía (Google Fonts): Cormorant Garamond peso 500 para titulares (grandes, elegantes); DM Sans para texto e interfaz.
- Estilo: sofisticado, femenino, minimalista y empresarial. Mucho espacio en blanco. Botones en forma de píldora (rounded-full) verde bosque con texto blanco, hover verde oscuro. Tarjetas blancas con borde #E8DDD3, radio 28px y al pasar el cursor se elevan 6px con sombra suave verde. Chips en píldora (rosa empolvado o menta). Etiquetas "eyebrow": mayúsculas, 13px, tracking .16em, color #8A5A4B. Imagen principal del hero en forma de arco (esquinas superiores muy redondeadas). Íconos de línea fina consistentes (lucide).
- Animaciones sutiles: aparición con fade-up al cargar/hacer scroll, flotado lento en tarjeta destacada, transiciones suaves. Respetar prefers-reduced-motion.

PRIMERA ITERACIÓN (solo esto):
1) Portada (landing) con: encabezado con logo (hoja verde en círculo menta + "Remanente" en serif) y navegación (Cómo funciona, Mercado, Pasaporte y certificado, Impacto) más "Ingresar" y "Registrar empresa". Hero: eyebrow "Economía circular · Lima y Callao", titular "Lo que sobra, vuelve a florecer." (la segunda línea en cursiva verde bosque), párrafo breve, botón grande "Sube una foto de tu merma" (por ahora lleva al registro/ingreso) y un bloque en arco con degradado menta a rosa empolvado como espacio de foto, con una tarjeta flotante rotulada "Vista de ejemplo". Sección "Del residuo al recurso, en cuatro pasos": Fotografía, Publica, Conecta, Certifica (tarjetas numeradas 01 a 04 en dorado rosado). Sección de mercado (tarjetas vacías con estado elegante "Aún no hay lotes publicados"). Sección verde oscuro "Cada lote tiene su pasaporte. Cada entrega, su certificado." con aviso "Documento emitido por Remanente. No es una certificación ambiental oficial." Sección de impacto con 4 contadores (kg desviados, CO₂e evitado estimado, agua ahorrada estimada, operaciones completadas) que lean la base de datos y muestren 0 si no hay datos. Footer con Términos y condiciones, Privacidad y Contacto.
2) Autenticación con Supabase Auth (Lovable Cloud): registro de empresa con nombre de empresa, RUC (validar solo formato: 11 dígitos), nombre del representante, correo, contraseña y confirmación, teléfono/WhatsApp (formato Perú), distrito, dirección y aceptación de términos; verificación de correo; inicio de sesión; recuperación de contraseña (con página de restablecimiento); cierre de sesión; rutas privadas protegidas; sesión persistente. Una misma cuenta de empresa puede comprar y vender. Tabla de empresas ligada a auth.users con RLS: cada empresa solo lee y edita lo suyo; los roles (admin) en una tabla aparte, nunca en el perfil.
3) Área privada con navegación y panel de inicio. Incluye accesos a Analizar merma, Publicar lote, Mercado, Impacto, Mapa, Mi perfil y Admin, pero las secciones aún no construidas deben mostrar claramente "Próximamente", sin datos simulados ni botones que finjan funcionar.

REGLAS: no inventes cifras ni datos de ejemplo en la base de datos. No uses fotos de stock por ahora (bloques con degradado como espacio de foto). No guardes claves en el frontend. Mantén el código modular para ampliar después con: análisis de fotos con IA, lotes con QR, marketplace con WhatsApp, certificados PDF verificables, panel de impacto y mapa de simbiosis. Al terminar, resume qué quedó funcionando y qué falta configurar.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/85b9cd31-a980-4c6f-9931-6f356c457872).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
