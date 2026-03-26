# Monchito Game Library — Roadmap de mejoras futuras

> Ideas y funcionalidades pendientes de implementar. Ordenadas por prioridad de mayor a menor.

---

## Índice

| Mejora | Prioridad |
|---|---|
| [Página de detalle de juego (`/games/:id`)](#página-de-detalle-de-juego-gamesid) | **Alta** |
| [Pedidos (`/orders`)](#pedidos-orders) | **Media-alta** |
| [Deuda técnica — análisis de código](#deuda-técnica--análisis-de-código) | **Media-alta** (1 ítem pendiente) |
| [Recomendaciones de juegos](#recomendaciones-de-juegos) | Media |
| [Dashboard de estadísticas (`/stats`)](#dashboard-de-estadísticas-stats) | Media |
| [Sincronización automática de metadatos RAWG](#sincronización-automática-de-metadatos-rawg) | Baja |
| [Perfiles públicos, amigos e interacción](#perfiles-públicos-amigos-e-interacción) | Muy baja |
| ~~[Rediseño de la card de wishlist](#rediseño-de-la-card-de-wishlist)~~ | ✅ Hecho |
| ~~[Testing (unit + integración)](#testing-unit--integración)~~ | ✅ Hecho |
| ~~[Estrategia de actualización PWA forzada](#estrategia-de-actualización-pwa-forzada)~~ | ✅ Hecho |
| ~~[PWA (Progressive Web App)](#pwa-progressive-web-app)~~ | ✅ Hecho |
| ~~[Wishlist (`/wishlist`) — migración v.2](#wishlist-wishlist--migración-v2)~~ | ✅ Hecho |
| ~~[Links de búsqueda en tiendas desde la wishlist](#links-de-búsqueda-en-tiendas-desde-la-wishlist)~~ | ✅ Hecho |
| ~~[Migrar a Angular zoneless puro](#migrar-a-angular-zoneless-puro)~~ | ✅ Hecho |
| ~~[Optimizar carga de imágenes con el CDN de RAWG](#optimizar-carga-de-imágenes-con-el-cdn-de-rawg)~~ | ❌ Descartada |

---

## Alta prioridad

### Página de detalle de juego (`/games/:id`)

Actualmente pulsar en una card abre directamente el formulario de edición. Con esta mejora se abre primero una página de detalle completa, con los botones de editar y eliminar dentro. Más limpio y con mucha más información disponible.

#### Estructura de la página

**Sección personal (datos de `user_games`)**
- Estado, plataforma, formato, condición, edición
- Precio pagado, tienda, fecha de compra
- Valoración personal y reseña
- Fechas de inicio, completado y platino
- Notas personales
- Botones: **Editar** (abre el formulario actual) y **Eliminar**

**Sección RAWG (datos de `game_catalog` + llamadas a la API)**
- Descripción completa
- Rating RAWG, puntuación Metacritic, clasificación ESRB
- Plataformas disponibles, géneros, desarrolladores, publishers
- Screenshots (carrusel)
- Tiendas donde comprarlo con links directos
- DLCs disponibles
- Juegos de la misma saga

#### Navegación

- La card deja de abrir el formulario de edición directamente — ahora navega a `/games/:id`.
- El botón **Editar** dentro del detalle abre el formulario actual (sin cambios en él).
- El botón volver regresa a la colección manteniendo los filtros activos.

#### Implementación

- Nueva ruta `/games/:id` con `GameDetailPage`.
- Los datos personales se leen de `user_games_full` (ya disponible).
- Los datos de RAWG que no están en `game_catalog` (DLCs, saga, tiendas con links) se piden en paralelo al endpoint de RAWG usando el `rawg_id` del juego:
  - `/games/{id}` — descripción completa, tiendas, ESRB
  - `/games/{id}/screenshots` — capturas
  - `/games/{id}/additions` — DLCs
- Si el juego es `source = 'manual'` (sin `rawg_id`), mostrar solo los datos personales y ocultar las secciones de RAWG.
- Cachear las respuestas de RAWG en memoria durante la sesión.

---

## Media-alta prioridad

### Pedidos (`/orders`)

Sección para gestionar pedidos de protectores y cajas de coleccionismo (principalmente de [boxprotectors.nl](https://www.boxprotectors.nl)). Sustituye el Excel que se usaba hasta ahora para coordinar pedidos conjuntos y repartir gastos.

Un pedido puede ser **individual** (solo el usuario) o **grupal** (varios usuarios de la app). En el caso grupal, el owner invita a sus amigos mediante un enlace/código y cada uno rellena sus cantidades. El sistema calcula automáticamente el pack óptimo a pedir y lo que debe pagar cada participante.

#### Flujo principal

1. El usuario crea un pedido (`draft`) y añade los productos que necesita con sus cantidades.
2. Opcionalmente genera un **enlace de invitación** y lo comparte (WhatsApp, Telegram…) con amigos que también usen la app.
3. Los amigos aceptan la invitación y se unen como miembros — cada uno rellena cuánto necesita de cada producto.
4. La vista de detalle muestra el total del grupo por producto y sugiere qué pack comprar (el más económico que cubra la suma total).
5. El owner elige el pack definitivo, marca el pedido como `ordered` y el sistema calcula el coste por persona (producto + envío + fee de PayPal, prorrateados; descuento opcional).
6. El pedido avanza por estados: `draft → ordered → shipped → received`.

#### Distinción cantidad necesitada / cantidad en este pedido

Cada participante puede indicar dos cantidades por producto:
- **`quantity_needed`**: total de cajas que necesita para su colección (puede ser más de lo que se pide ahora).
- **`quantity_this_order`**: lo que incluye en este pedido concreto (puede ser menos si se planea repartir en varios pedidos).

Esto permite ver qué queda pendiente para pedidos futuros y planificar mejor.

#### Catálogo de productos

Los productos son reutilizables entre pedidos. Los más habituales son los protectores de caja para cada formato de juego. Cada producto tiene los tamaños de pack disponibles en la web del proveedor.

Categorías habituales:
- **Cajas de juego**: BluRay, BluRay Extra, DVD, 3DS, DS, PSP, PSVita, Switch, Xbox One…
- **Cajas de consola**: PS4 Slim, PS5, Xbox 360, Xbox Series X, 3DS XL, DS…
- **Otros**: inlays de mando, cajas especiales bajo demanda.

#### Modelo de datos

**Tabla `order_products`** — catálogo global de protectores *(ya creada y poblada)*:
```sql
CREATE TABLE order_products (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,              -- ej: "Cajas tamaño BluRay"
  packs      JSONB NOT NULL DEFAULT '[]',-- ej: [{"quantity":10,"price":8.99,"url":"..."}]
  category   TEXT NOT NULL DEFAULT 'box'
               CHECK (category IN ('box', 'console', 'other')),
  notes      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
Gestionada desde `/management/protectors` (sección admin). Datos de seed en `docs/backend/protectors-seed-data.md`.

**Tabla `orders`** — cabecera del pedido:
```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT,                        -- ej: "Pedido marzo 2026"
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'ordered', 'shipped', 'received')),
  order_date      DATE,
  received_date   DATE,
  shipping_cost   NUMERIC(10,2),               -- coste total de envío (se reparte entre miembros)
  paypal_fee      NUMERIC(10,2),               -- fee total de PayPal (se reparte entre miembros)
  discount_amount NUMERIC(10,2),               -- descuento puntual negociado (opcional)
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tabla `order_members`** — participantes del pedido:
```sql
CREATE TABLE order_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member'
               CHECK (role IN ('owner', 'member')),
  joined_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id, user_id)
);
```

**Tabla `order_invitations`** — enlaces de invitación:
```sql
CREATE TABLE order_invitations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,             -- token aleatorio para la URL de invitación
  expires_at TIMESTAMP WITH TIME ZONE,
  used_by    UUID REFERENCES auth.users(id),   -- quién lo usó (null si aún no se ha usado)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tabla `order_lines`** — productos incluidos en el pedido:
```sql
CREATE TABLE order_lines (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL REFERENCES order_products(id),
  unit_price       NUMERIC(10,2) NOT NULL,     -- snapshot del precio en el momento del pedido
  pack_chosen      INTEGER,                    -- pack seleccionado por el owner (ej: 250)
  quantity_ordered INTEGER,                    -- cantidad total real pedida al proveedor
  notes            TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tabla `order_line_allocations`** — cantidades por participante y línea:
```sql
CREATE TABLE order_line_allocations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_line_id       UUID NOT NULL REFERENCES order_lines(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity_needed     INTEGER NOT NULL DEFAULT 0,     -- total que necesita para su colección
  quantity_this_order INTEGER NOT NULL DEFAULT 0,     -- lo que incluye en este pedido
  UNIQUE(order_line_id, user_id)
);
```

**RLS:**
- `orders`: el owner y los miembros pueden leer; solo el owner puede editar la cabecera.
- `order_members` / `order_lines` / `order_line_allocations`: legibles por todos los miembros del pedido; cada miembro solo puede editar sus propias allocations.
- `order_invitations`: solo el owner puede crear/revocar invitaciones.

#### Lógica de cálculo por persona

Para cada miembro, el coste total se calcula como:

```
coste_productos   = Σ (quantity_this_order × unit_price) por cada línea
parte_envio       = shipping_cost / número_de_miembros
parte_paypal      = paypal_fee / número_de_miembros
descuento_propo   = discount_amount × (coste_productos / total_productos_pedido)
total_a_pagar     = coste_productos + parte_envio + parte_paypal - descuento_propo
```

#### Sugerencia de pack óptimo

Para cada línea el sistema muestra:
- Suma de `quantity_this_order` de todos los miembros.
- Qué pack cubre ese total al menor coste unitario posible.
- Cuántas unidades sobrarían (y a quién asignarlas, si se quiere).

El owner toma la decisión final de qué pack elegir.

#### Presentación

- Nueva ruta `/orders` con entrada en nav-rail (desktop) y bottom-nav (móvil).
- **Lista de pedidos**: estado visual, total estimado, número de participantes.
- **Vista de detalle**: tabla de productos con cantidades por participante, resumen de costes por persona, sugerencia de pack óptimo.
- **Flujo de invitación**: botón "Invitar" genera un enlace copiable; el destinatario al abrirlo ve el pedido y puede unirse con un clic (requiere estar autenticado).
- **Permisos visuales**: los miembros solo ven activo el input de sus propias cantidades; el owner ve todo editable.

#### ~~Gestión de protectores (admin)~~ ✅ Implementado

El catálogo de protectores está disponible en `/management/protectors` (pestaña "Protectores" en el panel de administración).

El admin puede:
- Crear/editar protectores (nombre, categoría, notas, packs con cantidad + precio + URL).
- Activar/desactivar protectores (los desactivados no aparecen en nuevos pedidos pero se conservan en históricos).
- Todas las acciones quedan registradas en el audit log.

Al crear o editar un pedido, los protectores se cargarán directamente del catálogo activo.

---

### Deuda técnica — análisis de código

Análisis en profundidad del código de producción realizado con cobertura de tests al 95 %. Las mejoras identificadas no añaden funcionalidad nueva — reducen complejidad, eliminan duplicación y mejoran la mantenibilidad.

| # | Problema | Fichero/s afectado/s | Impacto | Esfuerzo |
|---|---|---|---|---|
| 1 | `UserPreferencesService` mezcla estado de perfil, caché de juegos y estado local de búsqueda RAWG en un único servicio global | `user-preferences.service.ts`, `settings.component.ts` | **Alto** — estado RAWG innecesariamente global; si hubiera dos instancias del banner picker compartirían estado accidentalmente | Medio |
| ~~2~~ | ~~`AppComponent._loadPreferences` aplica tema, idioma, avatar, banner y rol directamente desde el componente raíz — lógica de negocio mezclada con orquestación de UI~~ | — | ✅ Resuelto — extraído a `UserPreferencesInitService` | — |
| ~~3~~ | ~~`private get _userId()` duplicado en `GameListComponent` y `GameFormComponent`~~ | — | ✅ Resuelto — `requireUserId()` centralizado en `UserContextService` | — |
| ~~4~~ | ~~`_loadingEditData` en `GameFormComponent` es innecesario~~ | — | ✅ Resuelto — eliminado usando `{ emitEvent: false }` en `patchValue` | — |
| ~~5~~ | ~~`_mapRawgPlatformToCode` vive en un componente de presentación~~ | — | ✅ Resuelto — movido a `presentation/shared/rawg-platform.utils.ts` | — |
| ~~6~~ | ~~`onAvatarFileSelected` y `onBannerFileSelected` son casi idénticos~~ | — | ✅ Resuelto — extraído `_handleImageUpload` en `SettingsComponent` | — |
| ~~7~~ | ~~`SettingsComponent` gestiona suscripción manualmente (`_searchSubscription`)~~ | — | ✅ Resuelto — reemplazado por `takeUntilDestroyed` en constructor | — |
| ~~8~~ | ~~`getAllGamesForUser` y `getAllGamesForList` duplican el mismo bucle de paginación~~ | — | ✅ Resuelto — extraído helper privado `_paginateView` en el repositorio | — |
| ~~9~~ | ~~`rowItemSize` en `GameListComponent` tiene valores CSS hardcodeados en TypeScript~~ | — | ✅ Resuelto — comentarios actualizados con referencia al fichero SCSS | — |

#### Pendiente de abordar

1. **#1** — separar los signals de RAWG search de `UserPreferencesService` (mayor impacto, requiere revisar todos los consumidores)

---

## Media prioridad

### Recomendaciones de juegos

Sugerir juegos que el usuario no tiene en su colección basándose en sus platinos y favoritos. Se muestra de forma sutil dentro de la lista de juegos, no como sección nueva en el nav.

#### Lógica de cálculo

**Base:** los juegos candidatos son aquellos donde el usuario tiene `platinum = true` O `is_favorite = true`. Son los que mejor reflejan sus gustos reales.

**Paso 1 — Juegos similares individuales:**
Para cada juego candidato, llamar al endpoint de RAWG `/games/{rawg_id}/suggested` que devuelve juegos similares. Filtrar los resultados eliminando los que el usuario ya tiene en `user_games` (comparando por `rawg_id`).

**Paso 2 — Detección de patrones por género:**
Si entre todos los juegos sugeridos hay géneros que se repiten con frecuencia, priorizar esos géneros en las recomendaciones. Ejemplo: si 8 de tus platinos son de acción-aventura, las recomendaciones de ese género suben arriba.

**Paso 3 — Deduplicación:**
Un mismo juego puede aparecer como sugerencia de varios candidatos. Priorizar los que aparecen más veces — son los que más se parecen al perfil del usuario.

#### UI

- Panel sutil al final de la lista de juegos: "Puede que también te guste..." con un scroll horizontal de cards.
- Cada card muestra portada, título, géneros y rating de RAWG.
- Botón rápido para añadir el juego directamente a la colección o a la wishlist.
- Si el usuario no tiene platinos ni favoritos suficientes, no se muestra el panel.

#### Implementación

- Las llamadas a RAWG se hacen desde el frontend (no Edge Function) ya que dependen de la sesión del usuario.
- Cachear los resultados en memoria durante la sesión para no repetir llamadas a RAWG al navegar.
- No guardar las recomendaciones en Supabase — se calculan en tiempo real cada vez.
- RAWG puede no tener el endpoint `/suggested` para todos los juegos (juegos manuales o con poco dato). Ignorar silenciosamente los que fallen.

---

### Dashboard de estadísticas (`/stats`)

Nueva sección en el nav que sustituye las estadísticas actuales de la colección (juegos totales, gasto total, valoración media). Lo que hay ahora es la v.1 — al implementar esto esos datos se mueven aquí y se eliminan del header de la colección.

#### Estadísticas de colección

- Distribución por plataforma (cuántos juegos tienes en cada consola)
- Distribución por género
- Distribución por estado (`backlog`, `playing`, `completed`, `platinum`, `abandoned`, `owned`)
- Ratio completados vs backlog
- Gasto total por tienda
- Gasto total por año de compra
- Evolución de la colección en el tiempo (juegos añadidos por mes/año)
- Valoración media personal
- Juegos con platino / favoritos

#### Estadísticas de wishlist

- Total de juegos en la wishlist
- Gasto estimado (suma de `desired_price` de los items que lo tienen)
- Distribución por prioridad

#### Implementación

- Todos los cálculos se hacen en SQL directamente sobre `user_games` y `user_wishlist` — no hace falta ninguna tabla nueva.
- Crear vistas o queries específicas en Supabase para cada agrupación (o calcularlas en el repositorio con `.select()` y agregaciones).
- El tipo de gráfica (barras, tarta, líneas) se decide en el momento de implementar el frontend.
- Nueva ruta `/stats` y entrada en nav-rail (desktop) y bottom-nav (móvil).
- Componentes de tarjeta de estadística reutilizables para los valores simples (totales, medias).

---

## Baja prioridad

### Sincronización automática de metadatos RAWG

Los juegos guardados en `game_catalog` tienen los datos de RAWG del momento en que se añadieron. Con el tiempo RAWG actualiza esa información — nuevas plataformas, ports, remasters, cambios en rating o metacritic. Esta feature mantendría esos datos al día automáticamente sin intervención del usuario.

#### Cómo funciona

Una **Supabase Edge Function** (código TypeScript ejecutado en los servidores de Supabase, no en el navegador) se programaría para ejecutarse periódicamente (por ejemplo cada semana) mediante un **Supabase Cron Job**.

La función haría lo siguiente:
1. Consultar `game_catalog` filtrando por `source = 'rawg'` y `rawg_id IS NOT NULL`.
2. Para cada juego, llamar al endpoint de RAWG `/games/{rawg_id}`.
3. Actualizar en `game_catalog` los campos que pueden cambiar con el tiempo:
   - `platforms`, `parent_platforms`
   - `rating`, `rating_top`, `ratings_count`, `reviews_count`
   - `metacritic_score`, `metacritic_url`
   - `genres`, `tags`, `developers`, `publishers`
   - `screenshots`
   - `tba` (puede pasar de true a false cuando se anuncia fecha)
   - `released_date` (puede concretarse si era TBA)
4. Actualizar `last_synced_at` en cada registro procesado.

#### Consideraciones

- **Rate limit de RAWG:** la API gratuita tiene límite de peticiones. Procesar en lotes con delay entre llamadas o usar `last_synced_at` para priorizar los que llevan más tiempo sin actualizar.
- **Juegos manuales:** los registros con `source = 'manual'` no se tocan — no tienen `rawg_id`.
- **RAWG API key:** debe estar configurada como variable de entorno en Supabase (no en el frontend).
- La función vive en `supabase/functions/sync-rawg-metadata/index.ts` (directorio estándar de Edge Functions).

---

## Social *(prioridad muy baja)*

### Perfiles públicos, amigos e interacción

Convertir Monchito en una plataforma social donde los usuarios pueden compartir su colección, hacer amigos y recomendarse juegos. Es una feature grande que se puede construir en fases.

---

#### Fase 1 — Perfiles públicos y privacidad

**Comportamiento:**
- Cada usuario tiene un perfil accesible en `/u/:username` (requiere añadir campo `username` único en `user_preferences`).
- El usuario elige en su configuración si su perfil es **público** (visible para cualquiera) o **privado** (visible solo para amigos aprobados).
- Por defecto se muestra todo: colección, wishlist y valoraciones personales. En el futuro se puede añadir control granular por sección.

**Base de datos:**
- Añadir a `user_preferences`:
  ```sql
  ALTER TABLE user_preferences
    ADD COLUMN username TEXT UNIQUE,
    ADD COLUMN profile_visibility TEXT DEFAULT 'public'
      CHECK (profile_visibility IN ('public', 'private'));
  ```
- Actualizar RLS de `user_games` y `user_wishlist` para permitir lectura si el perfil es público o si existe amistad aceptada.

---

#### Fase 2 — Sistema de amigos

**Comportamiento:**
- Un usuario puede enviar solicitud de amistad a otro por username.
- El receptor puede aceptar o rechazar.
- Los amigos pueden ver el perfil aunque sea privado.

**Base de datos:**
- Nueva tabla `friendships`:
  ```sql
  CREATE TABLE friendships (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status     TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_user, to_user)
  );
  ```
- RLS: cada usuario solo ve sus propias solicitudes enviadas/recibidas y las amistades aceptadas.

**Presentación:**
- Sección `/friends` con pestañas: amigos, solicitudes recibidas, solicitudes enviadas.
- Buscador de usuarios por username.

---

#### Fase 3 — Interacción

**Recomendaciones:**
- Desde el detalle de un juego, botón "Recomendar a un amigo" que abre un selector de amigos con campo de mensaje opcional.
- Nueva tabla `game_recommendations`:
  ```sql
  CREATE TABLE game_recommendations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,
    message         TEXT,
    read            BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

**Comentarios:**
- Los usuarios pueden dejar un comentario público en un juego del catálogo (no en el `user_games` de alguien, sino sobre el juego en sí).
- Nueva tabla `game_comments`:
  ```sql
  CREATE TABLE game_comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

---

#### Fase 4 — Realtime (Supabase Realtime)

Una vez implementadas las fases anteriores, activar suscripciones en tiempo real para:
- Notificaciones al recibir una solicitud de amistad.
- Notificaciones al recibir una recomendación.
- Actualización en vivo del perfil de un amigo si estás viendo su colección.

Supabase Realtime usa WebSockets internamente. En Angular se integra suscribiéndose al canal del cliente de Supabase y actualizando las signals correspondientes cuando llega un evento.

---

#### Consideraciones generales
- La fase 1 es prerequisito de todo lo demás.
- La fase 2 es prerequisito de las fases 3 y 4.
- Cada fase es independiente y desplegable por separado.
- Los campos de valoración personal (`personal_rating`, `personal_review`) son los más sensibles — considerar ocultarlos por defecto en perfiles públicos y que el usuario los active explícitamente.

---

## Completado

### ~~Rediseño de la card de wishlist~~ ✅ Hecho

En mobile (≤768px) las cards de wishlist eran demasiado interactivas — botones de acción y links de tiendas interferían con el scroll. Solución: las cards en mobile son pulsables y navegan a una pantalla de detalle dedicada `/wishlist/:id` donde viven todas las acciones (editar, borrar, "ya lo tengo", links de tiendas). En desktop las cards mantienen el comportamiento anterior. Se corrigieron además dos bugs: el campo `platform` no se persistía al actualizar un ítem, y las plataformas de RAWG no se refrescaban al abrir el formulario de edición.

---

### ~~Testing (unit + integración)~~ ✅ Hecho

Vitest 4.1.0 configurado con `@angular/build:unit-test` + happy-dom. **973 tests en 61 ficheros**, con una cobertura de ~99 % de statements y ~95 % de branches. Se cubren todas las capas: mappers, use cases, repositorios, guards, servicios, componentes y abstractas. Ver detalles en `docs/TESTING.md`.

---

### ~~Estrategia de actualización PWA forzada~~ ✅ Hecho

`PwaUpdateService` reescrito con estrategia E: en rutas seguras (`/list`, `/wishlist`, `/settings`, etc.) muestra un overlay de pantalla completa con spinner y "Actualizando…" y recarga a los 400ms. En rutas de formulario (`/add`, `/update/:id`) espera a que el usuario navegue fuera y entonces aplica el mismo overlay. El SW se registra con `registerImmediately` (antes `registerWhenStable:30000`) y se comprueba `checkForUpdate()` al arrancar y en cada `visibilitychange` para detectar versiones nuevas lo antes posible.

---

### ~~PWA (Progressive Web App)~~ ✅ Hecho

`@angular/pwa` instalado. Service worker configurado con `ngsw-config.json` (prefetch del app shell, lazy de assets). `manifest.webmanifest` personalizado con nombre "Monchito Game Library", short_name "Monchito" y theme/background color `#1e1e2e`. `provideServiceWorker` registrado en `app.config.ts` (solo en producción). `PwaUpdateService` implementado: detecta `VERSION_READY` y muestra un snackbar "Nueva versión disponible / Actualizar" que recarga la página al confirmar.

---

### ~~Wishlist (`/wishlist`) — migración v.2~~ ✅ Hecho

Nueva sección `/wishlist` separada de la colección. Tabla `user_wishlist` con `desired_price`, `priority` (1–5) y `notes`. Vista `user_wishlist_full` actualizada para incluir `rawg_id`. Dominio completo (contract, use cases, Supabase repository, DTO, mapper, modelo, form interface). Página `WishlistPage` con lista, stats (total items y gasto estimado), empty state, add/edit dialog con búsqueda RAWG y formulario, `WishlistCardComponent` con estrellas de prioridad, precio, notas y acción "Tengo este juego" (elimina de wishlist y navega a /add pre-cargando el juego). `status = 'wishlist'` eliminado de `GameStatus` y del CHECK de `user_games`. Nav rail y bottom nav actualizados.

---

### ~~Links de búsqueda en tiendas desde la wishlist~~ ✅ Hecho

Links directos generados en tiempo real hacia Amazon, GAME, CEX y Xtralife desde cada card de la wishlist. Sin API ni scraping — URL construida con `encodeURIComponent(título + plataforma)`.

---

### ~~Migrar a Angular zoneless puro~~ ✅ Hecho

`provideZonelessChangeDetection()`, `provideAnimationsAsync()`, `zone.js` eliminado. `ngx-image-cropper` sustituido por implementación propia con drag+zoom+canvas crop.

---

### ~~Optimizar carga de imágenes con el CDN de RAWG~~ ❌ Descartada

Ya existe la utilidad `src/app/presentation/shared/image-url.utils.ts` (`optimizeImageUrl`) que transforma URLs de RAWG para usar su endpoint de redimensionado (`/media/resize/{width}/-/`). Integrarla en las cards y en cualquier lugar donde se muestren portadas de RAWG para reducir el tamaño de descarga (las imágenes originales pueden pesar varios MB; redimensionadas al ancho real de la card son ~10–30 KB).
