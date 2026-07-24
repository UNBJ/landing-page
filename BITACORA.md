# Bitacora del Proyecto

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
