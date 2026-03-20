# Monchito Game Library — Estado del Backend (Supabase)

> Última actualización: 2026-03-19
> Para recrear la base de datos desde cero ejecuta `docs/supabase-schema-current.sql`.

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
| `platinum` | BOOLEAN | Default FALSE |
| `status` | TEXT | `wishlist` / `backlog` / `playing` / `completed` / `platinum` / `abandoned` / `owned` |
| `personal_rating` | NUMERIC(2,1) | 0.0–10.0 |
| `personal_review` | TEXT | |
| `edition` | TEXT | Edición del ejemplar (ej: 'Deluxe Edition', 'GOTY') |
| `started_date` | DATE | |
| `completed_date` | DATE | |
| `platinum_date` | DATE | |
| `description` | TEXT | Notas personales |
| `tags_personal` | TEXT[] | |
| `is_favorite` | BOOLEAN | Default FALSE |
| `cover_position` | NUMERIC | Posición vertical del recorte de portada |
| `created_at` | TIMESTAMP TZ | |
| `updated_at` | TIMESTAMP TZ | Trigger automático |

**RLS:** Solo el propio usuario (SELECT / INSERT / UPDATE / DELETE).

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
| `theme` | TEXT | `'light'` \| `'dark'` |
| `language` | TEXT | `'es'` \| `'en'` |
| `avatar_url` | TEXT | URL pública del bucket `avatars` |
| `banner_url` | TEXT | URL pública del bucket `banners` o URL RAWG |
| `role` | TEXT | `'user'` \| `'admin'` — solo modificable via service role |
| `created_at` | TIMESTAMP TZ | |
| `updated_at` | TIMESTAMP TZ | Trigger automático |

**RLS:** Solo el propio usuario.

---

### `user_wishlist`

Lista de deseos personal de cada usuario. Pendiente de uso en UI.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK auth.users | ON DELETE CASCADE |
| `game_catalog_id` | UUID FK game_catalog | ON DELETE CASCADE |
| `desired_price` | NUMERIC(10,2) | |
| `priority` | INTEGER | 1–5 (1 = máxima) |
| `notes` | TEXT | |
| `notify_on_sale` | BOOLEAN | |
| `created_at` | TIMESTAMP TZ | |
| `updated_at` | TIMESTAMP TZ | Trigger automático |

**RLS:** Solo el propio usuario (SELECT / INSERT / UPDATE / DELETE).

---

## Vistas

Todas las vistas con datos de usuario usan `WITH (security_invoker = on)` para que el RLS se aplique correctamente.

### `user_games_full`

Join de `user_games` + `game_catalog`. Vista principal del frontend para leer la colección completa de un usuario.

Columnas destacadas: todos los campos de `user_games` (incluido `cover_position`) + datos básicos del catálogo (`title`, `slug`, `image_url`, `rating`, `metacritic_score`, `platforms`, `genres`, `tags`, `developers`, `publishers`, `source`).

```sql
SELECT * FROM user_games_full WHERE user_id = $1 ORDER BY created_at DESC;
```

### `user_wishlist_full`

Join de `user_wishlist` + `game_catalog`. Vista para leer la lista de deseos de un usuario con los datos del juego incluidos.

Columnas: `id`, `user_id`, `game_catalog_id`, `desired_price`, `priority`, `notes`, `created_at` + `title`, `slug`, `image_url`, `released_date`, `rating`, `metacritic_score`, `platforms`, `genres`.

```sql
SELECT * FROM user_wishlist_full WHERE user_id = $1 ORDER BY priority ASC;
```

---

## Storage Buckets

| Bucket | Público | Naming | Descripción |
|---|---|---|---|
| `avatars` | Sí | `{user_id}` | Foto de perfil. Un fichero por usuario, upsert. |
| `banners` | Sí | `{user_id}` | Banner de perfil personalizado. Se borra si el usuario selecciona un banner de RAWG. |

**Política RLS en ambos buckets:** solo el propio usuario puede subir y borrar su fichero.

---

## Triggers

| Trigger | Tabla | Evento | Acción |
|---|---|---|---|
| `trg_*_updated_at` | todas | BEFORE UPDATE | Actualiza `updated_at = NOW()` |
| `trg_increment_users_on_insert` | `user_games` | AFTER INSERT | Incrementa `game_catalog.times_added_by_users` |
| `trg_decrement_users_on_delete` | `user_games` | AFTER DELETE | Decrementa `game_catalog.times_added_by_users` |

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
