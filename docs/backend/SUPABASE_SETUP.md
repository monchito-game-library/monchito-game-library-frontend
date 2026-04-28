# Monchito Game Library — Estado del Backend (Supabase)

> Última actualización: 2026-04-15
> Para recrear la base de datos desde cero ejecuta `docs/backend/schema/supabase-schema-current.sql` y después los seeds de `docs/backend/seeds/`.

---

## Tablas

### `game_catalog`

Catálogo compartido de juegos. Un juego vive aquí una sola vez aunque varios usuarios lo tengan en su colección.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `rawg_id` | INTEGER UNIQUE | NULL para juegos manuales |
| `slug` | TEXT UNIQUE NOT NULL | |
| `title` | TEXT NOT NULL | |
| `description` | TEXT | HTML |
| `description_raw` | TEXT | Sin HTML |
| `released_date` | DATE | |
| `tba` | BOOLEAN | To Be Announced |
| `image_url` | TEXT | Portada principal |
| `background_image_additional` | TEXT | |
| `rating` | NUMERIC(3,2) | 0.00–5.00 (RAWG) |
| `rating_top` | INTEGER | Default 5 |
| `ratings_count` | INTEGER | |
| `reviews_count` | INTEGER | |
| `metacritic_score` | INTEGER | 0–100 |
| `metacritic_url` | TEXT | |
| `esrb_rating` | TEXT | E / E10+ / T / M / AO / RP |
| `platforms` | TEXT[] | ['PlayStation 5', 'PC', ...] |
| `parent_platforms` | TEXT[] | ['PlayStation', 'PC', ...] |
| `genres` | TEXT[] | |
| `tags` | TEXT[] | |
| `developers` | TEXT[] | |
| `publishers` | TEXT[] | |
| `stores` | JSONB | `[{"id":1,"name":"Steam","url":"..."}]` |
| `screenshots` | TEXT[] | URLs (hasta 6) |
| `website` | TEXT | |
| `source` | TEXT | `'rawg'` \| `'manual'` |
| `added_by_user_id` | UUID FK auth.users | Solo juegos manuales |
| `times_added_by_users` | INTEGER | Actualizado por trigger |
| `last_synced_at` | TIMESTAMP TZ | Última sync con RAWG |
| `created_at` | TIMESTAMP TZ | |
| `updated_at` | TIMESTAMP TZ | Trigger automático |

**RLS:** Lectura pública. Escritura solo para usuarios autenticados.

---

### `user_games`

Colección personal de cada usuario. Referencia al catálogo compartido.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `user_id` | UUID FK auth.users | ON DELETE CASCADE |
| `game_catalog_id` | UUID FK game_catalog | ON DELETE CASCADE |
| `price` | NUMERIC(10,2) | Precio de compra |
| `store` | UUID FK stores | NULL si desconocida |
| `platform` | TEXT | Plataforma del usuario |
| `condition` | TEXT | `'new'` \| `'used'` |
| `format` | TEXT | `'physical'` \| `'digital'` \| NULL |
| `purchased_date` | DATE | |
| `status` | TEXT | `wishlist` / `backlog` / `playing` / `completed` / `platinum` / `abandoned` / `owned` |
| `personal_rating` | NUMERIC(3,1) | 0.0–10.0 |
| `personal_review` | TEXT | |
| `edition` | TEXT | Edición del ejemplar (ej: 'Deluxe Edition', 'GOTY') |
| `started_date` | DATE | |
| `completed_date` | DATE | |
| `description` | TEXT | Notas personales |
| `tags_personal` | TEXT[] | |
| `is_favorite` | BOOLEAN | Default FALSE |
| `cover_position` | VARCHAR(20) | Posición focal del recorte de portada (ej: `'50% 20%'`) |
| `for_sale` | BOOLEAN NOT NULL | Default FALSE — el juego está publicado en venta |
| `sale_price` | NUMERIC(10,2) | Precio deseado de venta |
| `sold_at` | DATE | Fecha de venta real. `NULL` = en colección activa |
| `sold_price_final` | NUMERIC(10,2) | Precio final obtenido en la venta |
| `created_at` | TIMESTAMP TZ | |
| `updated_at` | TIMESTAMP TZ | Trigger automático |

**RLS:** Solo el propio usuario (SELECT / INSERT / UPDATE / DELETE).

**Índice único parcial:** `user_games_unique_per_platform` — `UNIQUE(user_id, game_catalog_id, platform, format, edition) WHERE sold_at IS NULL`. Solo impide duplicados en juegos activos; los vendidos no computan, permitiendo re-añadir un juego ya vendido.

---

### `stores`

Catálogo compartido de tiendas. Cualquier usuario puede añadir tiendas que quedan disponibles para todos.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `label` | TEXT NOT NULL | Nombre visible de la tienda |
| `format_hint` | TEXT | `'physical'` \| `'digital'` \| NULL — sugerencia de formato al seleccionar la tienda |
| `created_by` | UUID FK auth.users | NULL si la creó el sistema. ON DELETE SET NULL |
| `created_at` | TIMESTAMP TZ | |
| `updated_at` | TIMESTAMP TZ | Trigger automático |

**RLS:** Lectura pública. Escritura solo para usuarios autenticados.

---

### `user_preferences`

Configuración personal de cada usuario.

| Columna | Tipo | Notas |
|---|---|---|
| `user_id` | UUID PK FK auth.users | ON DELETE CASCADE |
| `theme` | TEXT | `'light'` \| `'dark'`. Default: `'light'` |
| `language` | TEXT | `'es'` \| `'en'` |
| `avatar_url` | TEXT | URL pública del bucket `avatars` |
| `banner_url` | TEXT | URL pública del bucket `banners` o URL RAWG |
| `role` | TEXT | `'user'` \| `'admin'` — modificable via el RPC `set_user_role` |

**RLS:** Solo el propio usuario.

> **Nota:** `user_preferences` **no tiene** columnas `created_at` ni `updated_at` en producción.

---

### `user_wishlist`

Lista de deseos personal de cada usuario. Pendiente de uso en UI.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK auth.users | ON DELETE CASCADE |
| `game_catalog_id` | UUID FK game_catalog | ON DELETE CASCADE |
| `platform` | TEXT NOT NULL | Plataforma de interés (ej: `'PS5'`) |
| `desired_price` | NUMERIC(10,2) | |
| `priority` | INTEGER | 1–5 (1 = máxima) |
| `notes` | TEXT | |
| `notify_on_sale` | BOOLEAN | |
| `created_at` | TIMESTAMP TZ | |
| `updated_at` | TIMESTAMP TZ | Trigger automático |

**UNIQUE:** `(user_id, game_catalog_id, platform)`

**RLS:** Solo el propio usuario (SELECT / INSERT / UPDATE / DELETE).

---

### `game_loans`

Historial de préstamos de juegos de la colección personal.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `user_game_id` | UUID FK user_games | ON DELETE CASCADE — el juego prestado |
| `loaned_to` | TEXT NOT NULL | Nombre de la persona a quien se prestó |
| `loaned_at` | DATE NOT NULL | Fecha del préstamo |
| `returned_at` | DATE | NULL mientras el préstamo está activo |
| `created_at` | TIMESTAMP TZ | |

**RLS:** Solo el propio usuario (via join con `user_games`).

> **Uso en vista:** `user_games_full` hace LEFT JOIN con `game_loans WHERE returned_at IS NULL` para exponer el préstamo activo como `active_loan_id`, `active_loan_to`, `active_loan_at`.

---

### `admin_audit_log`

Registro de acciones administrativas. Escrito por los use-cases de auditoría tras operaciones sensibles (crear/editar/eliminar tiendas, protectores, usuarios…).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `performed_by` | UUID FK auth.users NOT NULL | Usuario que realizó la acción |
| `performed_by_email` | TEXT | Email del usuario en el momento de la acción (nullable para compatibilidad con filas anteriores) |
| `action` | TEXT NOT NULL | Código de la acción, ej. `'store.create'` |
| `entity_type` | TEXT NOT NULL | Tipo de entidad afectada, ej. `'store'` |
| `entity_id` | TEXT | ID de la entidad afectada (como texto), nullable |
| `description` | TEXT NOT NULL | Descripción legible de la acción |
| `created_at` | TIMESTAMP TZ NOT NULL | Default `now()` |

**RLS:** Solo admins pueden leer (`user_preferences.role = 'admin'`). Cualquier usuario autenticado puede insertar filas donde `performed_by = auth.uid()`.

---

### `orders`

Cabecera de un pedido grupal.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `owner_id` | UUID FK auth.users | Usuario que creó el pedido |
| `title` | TEXT | Nombre descriptivo del pedido |
| `status` | TEXT NOT NULL | Default `'draft'`. Valores: `'draft'` \| `'selecting_packs'` \| `'ordering'` \| `'ordered'` \| `'received'` |
| `order_date` | DATE | Fecha en que se realizó el pedido |
| `received_date` | DATE | Fecha de recepción |
| `shipping_cost` | NUMERIC | Gastos de envío totales |
| `paypal_fee` | NUMERIC | Comisión PayPal |
| `discount_amount` | NUMERIC | Importe o porcentaje de descuento |
| `notes` | TEXT | Notas internas del pedido |
| `created_at` | TIMESTAMP TZ | |
| `updated_at` | TIMESTAMP TZ | Actualizado manualmente por el RPC `set_member_ready` y por el repositorio en cada `update()` |
| `discount_type` | TEXT NOT NULL | Default `'amount'`. Valores: `'percentage'` \| `'amount'` |

**RLS:**
- SELECT: `owner_id = auth.uid()` OR miembro en `order_members`
- INSERT: `owner_id = auth.uid()`
- UPDATE/DELETE: solo `owner_id = auth.uid()`

---

### `order_members`

Participantes de un pedido.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `order_id` | UUID FK orders | ON DELETE CASCADE |
| `user_id` | UUID FK auth.users | ON DELETE CASCADE |
| `role` | TEXT NOT NULL | Default `'member'`. Valores: `'owner'` \| `'member'` |
| `joined_at` | TIMESTAMP TZ | Default `now()` |
| `display_name` | TEXT | Nombre cacheado en el momento de unirse |
| `is_ready` | BOOLEAN NOT NULL | Default `false` — el miembro ha marcado sus líneas como listas |

**UNIQUE:** `(order_id, user_id)` — impide que un usuario aparezca dos veces en el mismo pedido.

**RLS:**
- SELECT: `user_id = auth.uid()` — **cada usuario solo ve su propia fila**. Los datos de todos los miembros se obtienen vía el RPC `get_order_members_info` (SECURITY DEFINER).
- INSERT: `user_id = auth.uid()`
- UPDATE: `user_id = auth.uid()` (política "Members can update own is_ready")
- DELETE: `user_id = auth.uid()` OR owner del pedido

---

### `order_products`

Catálogo compartido de productos que se pueden añadir a un pedido (protectores, fundas, etc.).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `name` | TEXT NOT NULL | Nombre del producto |
| `category` | TEXT NOT NULL | Default `'box'`. Categoría del producto |
| `notes` | TEXT | Notas adicionales |
| `is_active` | BOOLEAN NOT NULL | Default `true` — si está disponible para nuevos pedidos |
| `created_at` | TIMESTAMP TZ | Default `now()` |
| `updated_at` | TIMESTAMP TZ | Default `now()`. Trigger `trg_order_products_updated_at` |
| `packs` | JSONB NOT NULL | Default `'[]'`. Opciones de pack: `[{"url":"…","price":9.99,"quantity":50}]` |

**RLS:**
- SELECT: lectura pública (`true`) para cualquier usuario autenticado. Política adicional de admins para leer todos.
- INSERT/UPDATE: solo admins (`user_preferences.role = 'admin'`)

---

### `order_lines`

Líneas de un pedido: cada línea representa un producto solicitado por un miembro.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `order_id` | UUID FK orders NOT NULL | ON DELETE CASCADE |
| `product_id` | UUID FK order_products NOT NULL | |
| `unit_price` | NUMERIC NOT NULL | Precio unitario final |
| `pack_chosen` | INTEGER | Índice del pack elegido en `order_products.packs` |
| `quantity_ordered` | INTEGER | Unidades finalmente pedidas |
| `notes` | TEXT | |
| `created_at` | TIMESTAMP TZ | Default `now()` |
| `requested_by` | UUID FK auth.users | Miembro que añadió la línea (nullable) |
| `quantity_needed` | INTEGER | Unidades necesarias en total (nullable) |

**RLS:**
- SELECT: todos los miembros del pedido
- INSERT: todos los miembros del pedido (`requested_by` queda fijado al usuario que inserta)
- UPDATE/DELETE: solo el autor de la línea (`requested_by = auth.uid()`)

---

### `order_line_allocations`

Distribución de unidades de una línea entre los participantes.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `order_line_id` | UUID FK order_lines | ON DELETE CASCADE |
| `user_id` | UUID FK auth.users | ON DELETE CASCADE |
| `quantity_needed` | INTEGER NOT NULL | Default `0`. Unidades que necesita este miembro |
| `quantity_this_order` | INTEGER NOT NULL | Default `0`. Unidades que se le asignan en este pedido |

**UNIQUE:** `(order_line_id, user_id)` — usado por el upsert del repositorio.
**RLS:**
- SELECT: miembros del pedido (via join `order_lines → order_members`)
- INSERT/UPDATE: `user_id = auth.uid()`

---

### `order_invitations`

Tokens de invitación para que nuevos usuarios se unan a un pedido.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `order_id` | UUID FK orders | ON DELETE CASCADE |
| `token` | TEXT UNIQUE NOT NULL | UUID aleatorio generado en cliente |
| `expires_at` | TIMESTAMP TZ | NULL = sin expiración |
| `used_by` | UUID FK auth.users | NULL hasta que alguien lo usa |
| `created_at` | TIMESTAMP TZ | |

**RLS:**
- SELECT (pública): `true` — cualquiera puede leer por token (necesario para la página de aceptación sin sesión previa)
- SELECT (owner): solo el owner del pedido puede listar sus invitaciones
- INSERT/DELETE: solo el owner del pedido

---

### `hardware_brands`

Catálogo global de marcas de hardware (Sony, Microsoft, Nintendo…). Gestionado desde el panel de administración.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `name` | TEXT UNIQUE NOT NULL | Nombre de la marca |

**RLS:** Lectura para usuarios autenticados. Escritura solo para admins (`user_preferences.role = 'admin'`).

---

### `hardware_models`

Modelos de hardware agrupados por marca. Incluye consolas y mandos diferenciados por `type`.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `brand_id` | UUID FK hardware_brands | ON DELETE CASCADE |
| `name` | TEXT NOT NULL | Nombre del modelo |
| `type` | TEXT NOT NULL | `'console'` \| `'controller'` |
| `generation` | INTEGER | Generación de la consola (ej: 9 para PS5) |

**UNIQUE:** `(brand_id, name, type)`

**RLS:** Lectura para usuarios autenticados. Escritura solo para admins.

---

### `hardware_editions`

Ediciones especiales de un modelo (ej: "Final Fantasy XVI Limited Edition").

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `model_id` | UUID FK hardware_models | ON DELETE CASCADE |
| `name` | TEXT NOT NULL | Nombre de la edición |

**UNIQUE:** `(model_id, name)`

**RLS:** Lectura para usuarios autenticados. Escritura solo para admins.

---

### `hardware_console_specs`

Especificaciones técnicas de consolas. Relación 1:1 con `hardware_models` donde `type = 'console'`. Datos de referencia (Wikipedia).

| Columna | Tipo | Notas |
|---|---|---|
| `model_id` | UUID PK FK hardware_models | ON DELETE CASCADE |
| `launch_year` | INTEGER NOT NULL | Año de lanzamiento |
| `discontinued_year` | INTEGER | NULL = aún en venta |
| `category` | TEXT NOT NULL | `'home'` \| `'portable'` \| `'hybrid'` |
| `media` | TEXT NOT NULL | `'optical_disc'` \| `'digital'` \| `'cartridge'` \| `'hybrid'` \| `'built_in'` |
| `video_resolution` | TEXT | Resolución máxima (texto libre: `'4K'`, `'1080p'`) |
| `units_sold_million` | NUMERIC | Unidades vendidas en millones (acumulado por familia) |

**RLS:** Lectura para usuarios autenticados. Escritura solo para admins.

---

### `hardware_controller_specs`

Especificaciones técnicas de mandos. Relación 1:1 con `hardware_models` donde `type = 'controller'`. Actualmente solo contiene `model_id`; campos específicos se añadirán en futuras iteraciones.

| Columna | Tipo | Notas |
|---|---|---|
| `model_id` | UUID PK FK hardware_models | ON DELETE CASCADE |

**RLS:** Lectura para usuarios autenticados. Escritura solo para admins.

---

### `user_consoles`

Consolas de la colección personal de cada usuario.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `user_id` | UUID FK auth.users | ON DELETE CASCADE |
| `brand_id` | UUID FK hardware_brands | Marca de la consola |
| `model_id` | UUID FK hardware_models | Modelo de la consola |
| `edition_id` | UUID FK hardware_editions | Edición especial (opcional) |
| `region` | TEXT | `'PAL'` \| `'NTSC'` \| `'NTSC-J'` \| NULL |
| `condition` | TEXT NOT NULL | `'new'` \| `'used'` |
| `price` | NUMERIC(8,2) | Precio de compra |
| `store` | TEXT | UUID FK stores (guardado como texto) |
| `purchase_date` | DATE | |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `for_sale` | BOOLEAN NOT NULL | Default FALSE |
| `sale_price` | NUMERIC(10,2) | |
| `sold_at` | TIMESTAMPTZ | NULL = en colección activa |
| `sold_price_final` | NUMERIC(10,2) | |
| `active_loan_id` | UUID | FK lógica a `hardware_loans.id` |
| `active_loan_to` | TEXT | |
| `active_loan_at` | TIMESTAMPTZ | |

**RLS:** Solo el propio usuario (SELECT / INSERT / UPDATE / DELETE).

---

### `user_controllers`

Mandos de la colección personal de cada usuario.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `user_id` | UUID FK auth.users | ON DELETE CASCADE |
| `brand_id` | UUID FK hardware_brands | |
| `model_id` | UUID FK hardware_models | |
| `edition_id` | UUID FK hardware_editions | Edición especial (opcional) |
| `color` | TEXT NOT NULL | Color del mando (ej: `'#000000'`) |
| `compatibility` | TEXT NOT NULL | `'PS5'` \| `'PS4'` \| `'Xbox'` \| `'PC'` \| `'Switch'` \| ... |
| `condition` | TEXT NOT NULL | `'new'` \| `'used'` |
| `price` | NUMERIC(8,2) | |
| `store` | TEXT | UUID FK stores (guardado como texto) |
| `purchase_date` | DATE | |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `for_sale` | BOOLEAN NOT NULL | Default FALSE |
| `sale_price` | NUMERIC(10,2) | |
| `sold_at` | TIMESTAMPTZ | NULL = en colección activa |
| `sold_price_final` | NUMERIC(10,2) | |
| `active_loan_id` | UUID | FK lógica a `hardware_loans.id` |
| `active_loan_to` | TEXT | |
| `active_loan_at` | TIMESTAMPTZ | |

**RLS:** Solo el propio usuario (SELECT / INSERT / UPDATE / DELETE).

---

### `hardware_loans`

Historial de préstamos de consolas y mandos. Tabla polimórfica: `item_type` discrimina el tipo de ítem prestado.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `item_type` | TEXT NOT NULL | `'console'` \| `'controller'` |
| `user_item_id` | UUID NOT NULL | FK lógica a `user_consoles.id` o `user_controllers.id` |
| `loaned_to` | TEXT NOT NULL | Nombre de la persona a quien se prestó |
| `loaned_at` | TIMESTAMPTZ NOT NULL | Fecha del préstamo |
| `returned_at` | TIMESTAMPTZ | NULL mientras el préstamo está activo |
| `created_at` | TIMESTAMPTZ NOT NULL | Default `now()` |

**Índice:** `hardware_loans_item_idx` sobre `(item_type, user_item_id)`.

**RLS:** Solo el propio usuario (via join con `user_consoles` o `user_controllers`).

---

## Vistas

Todas las vistas con datos de usuario usan `WITH (security_invoker = on)` para que el RLS se aplique correctamente.

### `user_games_full`

Join de `user_games` + `game_catalog` + préstamo activo (`game_loans`). Vista principal del frontend para leer la colección completa de un usuario.

Columnas destacadas: todos los campos de `user_games` (incluidos `for_sale`, `sold_at`, `sold_price_final`, `cover_position`) + datos básicos del catálogo (`title`, `slug`, `image_url`, `rating`, `metacritic_score`, `platforms`, `genres`, `tags`, `developers`, `publishers`, `source`) + préstamo activo (`active_loan_id`, `active_loan_to`, `active_loan_at`).

El frontend filtra por `sold_at IS NULL` para la colección activa y por `sold_at IS NOT NULL` para el historial de ventas (`/games/sold`).

```sql
SELECT * FROM user_games_full WHERE user_id = $1 AND sold_at IS NULL ORDER BY created_at DESC;
```

### `user_wishlist_full`

Join de `user_wishlist` + `game_catalog`. Vista para leer la lista de deseos de un usuario con los datos del juego incluidos.

Columnas expuestas: `id`, `user_id`, `game_catalog_id`, `platform`, `desired_price`, `priority`, `notes`, `created_at` + `title`, `slug`, `image_url`, `released_date`, `rating`, `metacritic_score`, `platforms`, `genres`.

> **Nota:** `notify_on_sale` y `updated_at` de `user_wishlist` **no se exponen** en esta vista.

```sql
SELECT * FROM user_wishlist_full WHERE user_id = $1 ORDER BY priority ASC;
```

### `available_items`

UNION de `user_games_full` + `user_consoles` + `user_controllers` donde `for_sale = TRUE AND sold_at IS NULL`. Devuelve todos los artículos actualmente en venta de cualquier tipo.

Columnas expuestas: `id` (TEXT), `item_type` (`'game'` | `'console'` | `'controller'`), `item_name`, `brand_name` (NULL para juegos), `model_name`, `sale_price`, `user_id`, `created_at`.

### `sold_items`

UNION de `user_games_full` + `user_consoles` + `user_controllers` donde `sold_at IS NOT NULL`. Historial global de ventas de cualquier tipo de ítem.

Columnas expuestas: `id` (TEXT), `item_type` (`'game'` | `'console'` | `'controller'`), `item_name`, `brand_name` (NULL para juegos), `model_name`, `sold_price_final`, `sold_at`, `user_id`, `created_at`.

---

## Storage Buckets

| Bucket | Público | Naming | Descripción |
|---|---|---|---|
| `avatars` | Sí | `{user_id}` | Foto de perfil. Un fichero por usuario, upsert. |
| `banners` | Sí | `{user_id}` | Banner de perfil personalizado. Se borra si el usuario selecciona un banner de RAWG. |

**Política RLS en ambos buckets:** solo el propio usuario puede subir y borrar su fichero.

---

## Funciones RPC

Todas las funciones son `SECURITY DEFINER` — se ejecutan con los permisos del owner de la función, lo que permite saltar el RLS donde es necesario.

### `search_game_catalog(search_query TEXT)`

Busca juegos en `game_catalog` por título, descripción, desarrollador o publisher. Devuelve columnas seleccionadas + campo `relevance` (0–100) ordenadas por relevancia DESC, luego por rating DESC. Límite interno de 50 resultados. Usada por el buscador de juegos del frontend.

### `get_order_members_info(p_order_id UUID)`

Devuelve todos los miembros de un pedido enriquecidos con datos de `auth.users` y `user_preferences`. Necesaria porque el RLS de `order_members` solo permite ver la propia fila, y el frontend no tiene acceso directo a `auth.users`.

Campos devueltos: `id`, `order_id`, `user_id`, `role`, `is_ready`, `joined_at`, `display_name` (COALESCE de `om.display_name` y `auth.users.raw_user_meta_data`), `email`, `avatar_url` (COALESCE de `user_preferences.avatar_url` y `auth.users.raw_user_meta_data`). Resultados ordenados por `joined_at ASC`.

### `set_member_ready(p_order_id UUID, p_user_id UUID, p_is_ready BOOLEAN)`

Actualiza `order_members.is_ready` y a continuación hace `UPDATE orders SET updated_at = now()` para disparar el canal realtime del pedido (`order-{orderId}`), notificando a todos los participantes del cambio de estado.

### `set_user_role(target_user_id UUID, new_role TEXT)`

Hace UPSERT sobre `user_preferences.role` para el usuario indicado (crea la fila si no existe). Solo ejecutable por admins. Permite ascender o degradar usuarios sin exponer la tabla `user_preferences` al cliente con permisos de escritura general.

### `get_all_users_with_roles()`

Devuelve todos los usuarios de la aplicación enriquecidos con su rol de `user_preferences` y metadatos de `auth.users` (email, nombre, avatar). Necesaria porque el frontend no tiene acceso directo a `auth.users`. Solo ejecutable por admins.

---

## Realtime

Tablas habilitadas en la publicación `supabase_realtime`: `orders`, `order_members`, `order_lines`.

El repositorio suscribe a dos canales para refrescar la vista de detalle sin polling:

| Canal | Tabla | Evento | Filtro | Quién lo dispara |
|---|---|---|---|---|
| `order-{orderId}` | `orders` | UPDATE | `id = eq.{orderId}` | `update()` del repositorio y el RPC `set_member_ready` (toca `updated_at`) |
| `order-lines-{orderId}` | `order_lines` | UPDATE | `order_id = eq.{orderId}` | `updateLine()` del repositorio |

La limpieza de cada canal se hace al destruir `OrderDetailComponent` (función de cleanup devuelta por el repositorio).

---

## Triggers

| Trigger | Tabla | Evento | Acción |
|---|---|---|---|
| `trg_game_catalog_updated_at` | `game_catalog` | BEFORE UPDATE | Actualiza `updated_at = NOW()` |
| `trg_user_games_updated_at` | `user_games` | BEFORE UPDATE | Actualiza `updated_at = NOW()` |
| `trg_user_preferences_updated_at` | `user_preferences` | BEFORE UPDATE | Actualiza `updated_at = NOW()` |
| `trg_user_wishlist_updated_at` | `user_wishlist` | BEFORE UPDATE | Actualiza `updated_at = NOW()` |
| `trg_stores_updated_at` | `stores` | BEFORE UPDATE | Actualiza `updated_at = NOW()` |
| `trg_order_products_updated_at` | `order_products` | BEFORE UPDATE | Actualiza `updated_at = NOW()` |
| `trg_orders_updated_at` | `orders` | BEFORE UPDATE | Actualiza `updated_at = NOW()` |
| `trg_increment_users_on_insert` | `user_games` | AFTER INSERT | Incrementa `game_catalog.times_added_by_users` |
| `trg_decrement_users_on_delete` | `user_games` | AFTER DELETE | Decrementa `game_catalog.times_added_by_users` |

> **Nota:** `order_lines` no tiene trigger de `updated_at`. El campo `orders.updated_at` se actualiza tanto por el trigger `trg_orders_updated_at` como manualmente desde el RPC `set_member_ready` (para disparar el canal realtime sin modificar otros campos).

---

## Auth

Usa **Supabase Auth** nativo. El frontend solo usa autenticación por email/contraseña en este momento. Los UUIDs de `auth.users` son la clave foránea en todas las tablas.

---

## Credenciales

Configurar en `src/environments/environment.ts`:

```typescript
supabase: {
  url: 'https://<project-id>.supabase.co',
  anonKey: 'eyJ...'
}
```
