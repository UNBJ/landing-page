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

---

> [!NOTE]
> Para detalles de diseño iniciales y diagramas estructurales, consulta:
> [gallery_design_plan.md](file:///Users/raulcanul/Documents/Dev/unbj-page/gallery_design_plan.md) y la guía de setup **[r2_setup_guide.md](file:///Users/raulcanul/.gemini/antigravity-cli/brain/908e3851-800c-4e9f-8213-9cf93319abf9/r2_setup_guide.md)**.

