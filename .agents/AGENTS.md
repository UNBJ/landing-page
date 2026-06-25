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

## 🎯 Próximos Pasos en Siguientes Sesiones

Cuando inicies una nueva sesión para implementar la galería, sigue este orden de trabajo:
1. **Configurar bucket en Cloudflare R2**: Activar CORS para el dominio y localhost.
2. **Crear script de sincronización**: Desarrollar `scripts/sync-photos.js` para leer del bucket de R2 usando el cliente S3 y escribir en `src/data/photos.json`.
3. **Crear componentes de galería en React**: `GalleryGrid.jsx` (con lazy loading/paginación) y `Lightbox.jsx` (con soporte swipe y teclado).
4. **Implementar páginas en Astro**: `src/pages/fotos/[dia].astro` para renderizar el listado por día y enlazarlo desde la sección de la landing page en `src/pages/index.astro`.

---

> [!NOTE]
> Puedes consultar el plan de diseño sumamente detallado con diagramas en el archivo:
> [gallery_design_plan.md](file:///Users/raulcanul/Documents/Dev/unbj-page/gallery_design_plan.md)

