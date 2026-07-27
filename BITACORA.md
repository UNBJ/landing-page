# Bitacora del Proyecto

## 2026-07-26 - Seccion Instagram

- Se implemento la nueva seccion `Instagram` en `src/pages/index.astro`, basada en los frames seleccionados en Pencil para desktop, tablet y mobile.
- Se inserto directamente antes de la seccion `Calendario de Actividades`, sin agregarla al menu de navegacion.
- Se agrego `id="instagram"`, handle `@conajeba2026` y CTA externo a `https://www.instagram.com/conajeba2026/` con apertura en pestana nueva.
- Se replico la direccion visual del diseno: fondo crema, caption rojo, titulo serif, divisor, bloque de handle con icono y boton delineado.
- Se usaron los breakpoints actuales del proyecto (`1024px` y `640px`) y se agrego el copy mobile especifico del diseno.
- Verificacion: `npm run build` compila correctamente. Durante el build, R2 no resolvio DNS y se uso fallback de fotos.

## 2026-07-25 - Galeria sin Placeholders

- Se eliminaron las fotos placeholder de Unsplash cuando Cloudflare R2 no tiene imagenes disponibles o falla la sincronizacion.
- Causa del problema: `scripts/sync-photos.js` generaba datos mock con URLs de Unsplash, y la home/paginas de fotos podian renderizar esas imagenes como si fueran contenido real.
- Solucion aplicada: el fallback de sincronizacion ahora escribe dias vacios en `src/data/photos.json`; la home y las paginas `/fotos/[dia]` filtran URLs de Unsplash y muestran un mensaje cuando no hay imagenes reales.
- Se agrego estado vacio en `GalleryGrid` y en el collage de la home con el mensaje `No hay imágenes disponibles por el momento.`
- Verificacion: `npm run build` compila correctamente. Durante el build, R2 no resolvio DNS y se genero una galeria vacia.

## 2026-07-24 - Ajuste Fondo Modal Croquis

- Se corrigio el fondo del croquis al abrirlo en el modal ampliado.
- Causa del problema: `public/croquis-campus.png` conserva transparencia para verse bien sobre el fondo crema de la pagina, pero en el modal esa transparencia dejaba ver el overlay oscuro.
- Solucion aplicada: se agrego fondo crema, borde sutil y radio leve a `.croquis-lightbox__viewport` para que el PNG transparente tenga una superficie clara propia al ampliarse.
- Verificacion: `npm run build` compila correctamente. Durante el build, R2 no resolvio DNS y se uso fallback de fotos.

## 2026-07-23 - Seccion Grupos Devocionales

- Se implemento la nueva seccion `Grupos Devocionales` en `src/pages/index.astro`, tomando como base los frames seleccionados en Pencil.
- Se agrego la fuente de datos `src/data/devotional-groups.json` con los enlaces de WhatsApp extraidos desde `Hoja 1.html`.
- Se mantuvo la direccion visual del diseno de Pencil: fondo crema, titulo serif centrado, divisor sutil y tarjetas minimalistas.
- Se ajusto el layout responsivo de las tarjetas para evitar cortes de texto y superposicion del icono de WhatsApp.
- Causa del problema detectado: desktop forzaba 6 columnas dentro de un contenedor demasiado angosto, dejando tarjetas de ancho insuficiente para numero, texto e icono.
- Solucion aplicada: el grid desktop ahora usa columnas adaptativas con ancho minimo funcional (`minmax(220px, 1fr)`) y el contenedor de la seccion se amplio a `1600px`.
- Se reservaron columnas internas fijas para numero e icono, dejando el texto en una columna flexible (`minmax(0, 1fr)`).
- En tablet y mobile se conservaron breakpoints especificos para controlar columnas, espaciado y tamano del icono.
- Verificacion: `npm run build` compila correctamente. Durante el build, R2 no resolvio DNS y se uso fallback de fotos; despues se restauro `src/data/photos.json` para no mezclar cambios generados.

## 2026-07-23 - Ajuste Croquis en iOS

- Se detecto que el croquis se desalineaba en iPhone: los labels `SALON` no coincidian con el mapa y el modal mostraba el plano recortado.
- Causa del problema: `public/croquis-campus.svg` combina un `foreignObject` con HTML/CSS interno para el plano y textos SVG externos para los labels. Safari/iOS puede escalar esas capas de forma distinta.
- Solucion aplicada: se genero `public/croquis-campus.png` desde el SVG usando Chrome headless, para rasterizar mapa y labels como una sola imagen.
- El PNG se regenero con canal alfa para conservar fondo transparente y evitar el bloque blanco alrededor del croquis.
- La pagina ahora usa `/croquis-campus.png` en la vista normal, en el modal y en el enlace de descarga.
- Se elimino el ancho fijo con scroll horizontal en mobile; el croquis ahora se ajusta al ancho disponible y el modal usa `object-fit: contain` con limites de `max-width` y `max-height`.
- Verificacion: `npm run build` compila correctamente. Durante el build, R2 no resolvio DNS y se uso fallback de fotos; despues se restauro `src/data/photos.json` para no mezclar cambios generados.
