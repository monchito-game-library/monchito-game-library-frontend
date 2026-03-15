# Monchito Game Library — Roadmap de mejoras futuras

> Ideas y funcionalidades pendientes de implementar. Sin orden de prioridad.

---

## UI / UX

### Versión responsive para móvil
Actualmente la app está optimizada para escritorio. Adaptar todos los layouts (game-list, game-form, settings, management) para que funcionen correctamente en pantallas de móvil y tablet.

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

## Roles y permisos

### Usuarios admin
Introducir un sistema de roles (admin / usuario estándar) para restringir el acceso a las secciones de gestión (`/management`) solo a administradores. Esto también habilitaría la edición de la base de datos maestra de juegos.
