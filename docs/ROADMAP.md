# Monchito Game Library — Roadmap de mejoras futuras

> Ideas y funcionalidades pendientes de implementar. Sin orden de prioridad.

---

## UI / UX

### Posicionamiento de imagen en cards
Al añadir o editar un juego, permitir ajustar el punto focal de la portada que se muestra en la card. Funcionaría igual que el crop de avatar/banner:
- Al subir o seleccionar una imagen, mostrar un panel de ajuste (drag) donde el usuario puede desplazar la imagen dentro de su marco (3:4).
- Guardar los valores `object-position` (X e Y en porcentaje) junto al juego en base de datos.
- La card aplica esos valores con `object-position: X% Y%` en la imagen, de modo que siempre se muestre la parte que el usuario eligió.
- Si no se ha configurado posición, usar el valor por defecto `center`.

---

## Arquitectura / Rendimiento

### Migrar a Angular zoneless puro
Reemplazar `provideAnimations()` por `provideExperimentalZonelessChangeDetection()` y eliminar `zone.js` de los polyfills. El proyecto ya usa `OnPush` + signals en todo, por lo que la migración es sencilla. Beneficios: ~13 KB menos de bundle, simplificación del código async (sin `NgZone`). Riesgo principal: verificar compatibilidad de `ngx-image-cropper` con el flujo de crop de avatar/banner.

### Optimizar carga de imágenes con el CDN de RAWG
Ya existe la utilidad `src/app/presentation/shared/image-url.utils.ts` (`optimizeImageUrl`) que transforma URLs de RAWG para usar su endpoint de redimensionado (`/media/resize/{width}/-/`). Integrarla en las cards y en cualquier lugar donde se muestren portadas de RAWG para reducir el tamaño de descarga (las imágenes originales pueden pesar varios MB; redimensionadas al ancho real de la card son ~10–30 KB).

---

## Gestión (`/management`)

### Base de datos maestra de juegos
Crear una sección de administración para gestionar un catálogo propio de juegos, independiente de RAWG:
- Subida de imágenes propias (portadas, capturas)
- Cruce con RAWG para enriquecer datos (rating, plataformas, géneros, descripción)
- Los datos propios tienen prioridad sobre los de RAWG cuando ambos existen
- Solo accesible para usuarios admin

### Agrupaciones / colecciones de juegos
Posibilidad de marcar un juego como una colección que contiene otros títulos. Ejemplo: *God of War Collection (PS3)* agrupa *God of War (PS3)* y *God of War II (PS3)*. Implicaciones:
- Modelo de datos: relación padre-hijos en `game_catalog`
- En la card y el detalle mostrar los títulos que incluye
- Al filtrar o contar, decidir si la colección cuenta como 1 o como N juegos

---

## Nuevas secciones

### Pedidos (`/orders`)
Nueva sección en el nav-bar para gestionar pedidos de cajas de plástico duro (y similares). Posibles campos:
- Título / referencia del pedido
- Tipo de caja (PS1, PS2, PS3, PS4/PS5, Switch, etc.)
- Cantidad
- Estado del pedido (pendiente, enviado, recibido)
- Tienda / proveedor
- Precio
- Fecha de pedido / recepción

---

