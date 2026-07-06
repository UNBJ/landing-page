# Memoria del Proyecto: Galería de Fotos UNBJ

Este archivo sirve como bitácora y memoria del proyecto para agentes de IA y desarrolladores en futuras sesiones. Contiene el contexto de las decisiones de diseño y la arquitectura acordada para la sección de fotos del congreso.

---

## 📋 Contexto General del Proyecto
- **Sitio**: Landing page para **https://unbj.cnbm.mx/**.
- **Hosting**: Hostinger Shared Hosting (se sube la carpeta compilada `dist/` comprimida en `dist.zip` de forma manual o FTP).
- **Stack Tecnológico**: Astro (SSG) + React + TypeScript.

---

## 🛠️ Decisiones de Arquitectura y Flujo (Acordadas el 25-Jun-2026)

Tras una sesión de alineación (`/grill-me`), se definieron las siguientes especificaciones técnicas y de experiencia de usuario:

1. **Almacenamiento de Fotos**: **Cloudflare R2**
   - **Razón**: Costo de transferencia/descarga (egress fees) de $0. Dado que se esperan 500+ fotos por día (~2,000 en total) y descargas masivas en alta resolución desde móviles, R2 evita facturas sorpresa.
   - **Estructura en R2**: Carpetas `/lunes`, `/martes`, `/miercoles`, `/jueves`.

2. **Sincronización de Datos**: **Compilación Local con JSON Estático**
   - **Flujo**: El organizador sube las fotos a R2. Antes del deploy, se corre localmente un script de Node.js (`sync-photos.js`) que usa el S3 SDK para leer el bucket y generar `src/data/photos.json`.
   - Luego, se compila el sitio (`npm run build`) para generar el HTML/CSS/JS estático.

3. **Optimización de Imágenes**:
   - Para no ralentizar la carga ni sobrecargar los navegadores de los usuarios con imágenes originales de 5-10MB, se generarán **miniaturas optimizadas** durante el proceso de build.
   - La galería mostrará las miniaturas ligeras y el botón de descarga enlazará directamente al archivo original en alta resolución.

4. **Navegación e Interfaz (UI/UX)**:
   - **Landing Page**: Sección "Galería de Fotos" con pestañas para Lunes, Martes, Miércoles y Jueves. Cada pestaña muestra una cuadrícula tipo collage estática de 6-8 fotos destacadas y un botón CTA: `"Ver todas las fotos del [Día] (+500 fotos) →"`.
   - **Subpáginas por Día (`src/pages/fotos/[dia].astro`)**: Grid responsivo masonry en React con paginación/scroll infinito para manejar de forma eficiente las 500+ fotos diarias.
   - **Visualizador Lightbox (React)**: Modal de pantalla completa con fondo negro translúcido (`rgba(28,28,28,0.95)`), navegación por gestos táctiles (*swipe*) en móviles y teclas de flecha en desktop.
   - **Soporte Móvil Híbrido**: El botón de descarga iniciará la descarga directa (guardando en la carpeta Descargas/Archivos del dispositivo), y se mostrará un aviso sutil indicando al usuario que puede mantener presionada la foto para guardarla directamente en su carrete/Galería (esencial para usuarios de iOS).

5. **Diseño Visual**:
   - Seguir el diseño de la landing page con fondo crema (`#E9E7E1`), textos oscuros (`#1C1C1C`), acento rojo (`#D85446`), tipografía serif `Playfair Display` para títulos y sans-serif `Inter` para controles de la interfaz.

---

## ✅ Implementación y Logros (Completado el 25-Jun-2026)

Todo el flujo de la galería de fotos ha sido implementado con éxito:

1. **Sincronización con R2**: El script `scripts/sync-photos.js` se conecta a Cloudflare R2 y genera `src/data/photos.json` localmente antes de compilar. Cae de vuelta a un set mock de 12 fotos de Unsplash (múltiplo exacto de 2, 3 y 4 columnas para evitar espacios vacíos en el grid) si no detecta credenciales locales.
2. **Pestañas y Collage (Landing Page)**: La sección `#galeria` en `src/pages/index.astro` cuenta con pestañas de Lunes a Jueves y collages asimétricos con bordes de 0px (estética afilada). Su cabecera fue bautizada como **"Destellos del Alba"** y el subtítulo como **"Revive los momentos más significativos del CONAJEBA 2026, día por día."**
3. **Subpáginas Diarias (`src/pages/fotos/[dia].astro`)**: Diseñadas de forma minimalista en crema/negro. La cabecera muestra la leyenda **"Destellos del [Día]"** y el subtítulo del congreso. El menú de navegación de la derecha muestra el **Escudo SVG de la UNBJ** con enlace de retorno al home.
4. **Visualizador Lightbox & Descargas**: El modal en React (`src/components/Lightbox.tsx`) incluye navegación táctil (deslizar/swipe) para móviles, flechas del teclado en desktop, un indicador de fotos y descarga directa mediante fetch/blob en navegadores (cayendo de vuelta a descarga directa de pestaña si hay restricciones CORS).
5. **Configuración de Cloudflare R2**: Conectado exitosamente en local. El usuario configuró el R2 Token con permisos de lectura (`Read`) sobre el bucket `conajeba-photos`, configuró el S3 API endpoint como `R2_ENDPOINT` en `.env` y activó la política CORS para permitir descargas directas desde `localhost` y `unbj.cnbm.mx`.

---

## 🔧 Mantenimiento Futuro y Despliegue
* **Compilación**: Para regenerar el compilado estático para Hostinger con fotos nuevas de R2, ejecuta:
  ```bash
  npm run build
  ```
  Esto generará la carpeta `dist/` y actualizará automáticamente el paquete `dist.zip` en la raíz.
* **Caché en Desarrollo**: Astro/Vite cachean los datos importados de JSON estáticos al inicio. Si ejecutas `npm run sync-photos` con el servidor dev encendido, debes reiniciar el servidor (`npm run dev`) para ver los cambios reflejados.
* **Despliegues de Prueba (Vercel)**:
  * Para crear entornos de prueba/preview sin alterar producción en Hostinger, se puede usar Vercel.
  * Despliegue rápido por CLI: ejecuta `npx vercel` y sigue las instrucciones de la terminal.
  * Despliegue continuo: conecta el repositorio de GitHub al dashboard de Vercel.
  * **IMPORTANTE**: En la configuración del proyecto en la web de Vercel, se deben agregar las variables de entorno de Cloudflare R2 (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`) para que el servidor de Vercel pueda listar y compilar las fotos reales durante el despliegue.
* **Seguridad en Git (.gitignore)**:
  * El archivo `.gitignore` ha sido configurado para excluir archivos temporales de compilación, credenciales secretas de variables de entorno (todas las variantes de `.env`), las carpetas de caché de despliegue (`.vercel/`, `.netlify/`) y los paquetes ZIP compilados (`dist.zip`).

---

## 🎨 Actualización de Diseño de Subpáginas (27-Jun-2026)

Se actualizó el diseño visual de `src/pages/fotos/[dia].astro` y `src/components/GalleryGrid.tsx` para alinearlos con los 3 frames de Pencil (`gallery.pen`): Desktop (1440px), Tablet (820px) y Mobile (390px).

### Cambios en `[dia].astro`
- **Eyebrow**: cambiado de "Galería de Fotos" → `"GALERÍA"` (uppercase, letter-spacing: 2px).
- **Título**: tamaño aumentado a 72px (desktop) → 56px (≤1024px) → 42px (≤640px), lineHeight 1.05 en mobile.
- **Subtítulo**: formato `{date} · Congreso UNBJ 2026`.
- **Contador de fotos**: visible como texto alineado a la derecha del título en desktop/tablet; en mobile se reemplaza por un bloque con ícono de imágenes + cantidad.
- **Header**: texto "Volver a la página principal" (desktop) / "Volver" (mobile); wordmark `"U N B J"` con letter-spacing: 3px en Inter.
- **Padding del grid**: 64px top en desktop; 0px en tablet/mobile (el `<main class="grid-section">` lo maneja).

### Cambios en `GalleryGrid.tsx`
- **Estructura del grid**: migrado de CSS `column-count` (masonry browser-driven) a **columnas flex explícitas con distribución round-robin** en React, igual que el diseño de Pencil.
  - Se detecta el viewport con `useEffect` + `resize listener`.
  - Columnas: 4 (≥1280px) · 3 (≥820px) · 2 (<820px).
  - Distribución: foto 0 → col 0, foto 1 → col 1, foto 2 → col 2 … (round-robin).
- **Gaps**: 16px (desktop) · 12px (tablet) · 8px (mobile), aplicados vía inline style en el contenedor y las columnas.
- **Botón "Cargar más"**: renombrado a `"CARGAR MÁS FOTOS"` (uppercase, letter-spacing: 2px, sin ícono, outline 1px). Full-width en mobile.
- **Texto de paginación**: `"Mostrando X de Y fotos"` siempre visible debajo del botón.

---

## 📅 Sección Calendario de Actividades (03-Jul-2026)

Se implementó la sección **"Calendario de Actividades"** en `src/pages/index.astro`, ubicada entre el hero y la galería, a partir de los 3 frames de Pencil (`unbj-landing.pen`): "Calendario Alt — Desktop" (1440px), "Tablet" (834px) y "Mobile" (390px).

### Estructura y datos
- **Datos**: `src/data/schedule.json` con los 4 días completos (Lunes 7 eventos, Martes 17, Miércoles 17, Jueves 15). Cada evento tiene `horario` (formato `"H:MM — H:MM"` con raya larga), `actividad`, `duracion` y `tipo`:
  - `normal`: fila estándar.
  - `destacado`: hora y actividad en rojo (usado en todos los "Acceso a las puertas").
  - `principal`: borde izquierdo rojo, tag "EVENTO PRINCIPAL" y título grande en Playfair (Cultos Magnos de Lunes/Martes/Miércoles y "Noche de adoración — Cierre" del Jueves).
- **Layouts**: Desktop = rail izquierdo de 380px (encabezado + selector vertical de días con hairlines + nota) y timeline a la derecha (columna de horas de 140px). Tablet (≤1024px) = apilado con selector horizontal. Mobile (≤640px) = cada evento es una tarjeta con borde izquierdo; hora y duración corta en una fila.
- **Interactividad**: mismo patrón que la galería — script inline (sin React) que cambia panes, caption "PROGRAMA · DÍA 0X", etiqueta del día y conteo de actividades, con ARIA de tabs.
- **Fuentes**: el link de Google Fonts se amplió a Inter 400/500/600 y Playfair Display 400/700 (antes solo Inter 500 y Playfair itálica).
- **Subtítulo de la sección**: `"CONAJEBA 2026 Como el Alba — Satélite, CDMX."`

### Marcador "EN CURSO" en tiempo real
Durante el congreso, la actividad que está ocurriendo se marca en vivo:
- **Fechas del congreso**: mapa `congresoFechas` en `index.astro` → `2026-07-27` (lunes) a `2026-07-30` (jueves). Si cambian las fechas, solo se edita ese mapa.
- **Reloj**: siempre hora de CDMX (`America/Mexico_City` vía `Intl.DateTimeFormat`), sin importar la zona del visitante.
- **Lógica**: cada evento se genera con `data-inicio`/`data-fin` en minutos (parseados del `horario` en build). Si la hora actual cae en el rango, el evento recibe la clase `cal-evento--vivo`; los traslapes se marcan en paralelo. Un timer re-evalúa cada 60s.
- **Visual**: borde izquierdo rojo + badge "● EN CURSO" con punto pulsante, tipografía normal. Si coincide con el evento principal, el tag muestra "EVENTO PRINCIPAL · ● EN CURSO" conservando el diseño principal. Sin actividad en curso no se marca nada.
- **Al cargar**: en día de congreso la sección abre automáticamente en el día actual; fuera de fechas abre en Lunes.
- **Cómo probarlo antes del congreso**: agregar temporalmente la fecha de hoy al mapa, p. ej. `'2026-07-04': 'martes'`, correr `npm run dev` y verificar; **quitar la línea antes de hacer deploy** (la prueba del 03-Jul ya fue revertida).

---

> [!NOTE]
> Para detalles de diseño iniciales y diagramas estructurales, consulta:
> [gallery_design_plan.md](file:///Users/raulcanul/Documents/Dev/unbj-page/gallery_design_plan.md) y la guía de setup **[r2_setup_guide.md](file:///Users/raulcanul/.gemini/antigravity-cli/brain/908e3851-800c-4e9f-8213-9cf93319abf9/r2_setup_guide.md)**.

