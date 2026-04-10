# Monchito Game Library — Roadmap de mejoras futuras

> Ideas y funcionalidades pendientes de implementar. Ordenadas por prioridad de mayor a menor.

---

## Índice

| Mejora | Prioridad |
|---|---|
| [Préstamos de juegos](#préstamos-de-juegos) | **Alta** |
| [Historial de ventas (`/games/sold`)](#historial-de-ventas-gamessold) | Media |
| [Integración RAWG en detalle de juego](#integración-rawg-en-detalle-de-juego) | Media |
| [Recomendaciones de juegos](#recomendaciones-de-juegos) | Media |
| [Dashboard de estadísticas (`/stats`)](#dashboard-de-estadísticas-stats) | Baja |
| [Sincronización automática de metadatos RAWG](#sincronización-automática-de-metadatos-rawg) | Baja |
| [Perfiles públicos, amigos e interacción](#perfiles-públicos-amigos-e-interacción) | Muy baja |

---

## Alta prioridad

### Préstamos de juegos

Marcar un juego físico de la colección como prestado a un amigo para que quede registrado que no está en la estantería. Solo aplica a juegos con `format = 'physical'`.

#### Comportamiento

- Desde la card o la página de detalle del juego, el usuario pulsa **"Prestar"**.
- En desktop se abre un `MatDialog`; en mobile (≤768px) un `MatBottomSheet` (patrón ya establecido en el proyecto).
- El formulario tiene dos campos: **¿A quién?** (texto libre) y **Fecha** (date picker, hoy por defecto).
- Al guardar, el juego muestra un chip en la card con icono `person` + nombre truncado (~12 chars): _"Prestado · Juan G."_.
- Para recuperarlo: botón **"Marcar como devuelto"** en el mismo dialog/sheet, que rellena `returned_at` con la fecha actual.

#### v1 / v2

- **v1:** el receptor del préstamo es texto libre (nombre escrito a mano).
- **v2 (cuando exista sección social):** el campo de texto se convierte en un selector híbrido — primero muestra los contactos de la lista de amigos y, si no está, permite escribir texto libre igualmente.

#### UI en la card

- Chip compacto en la zona overlay de la card (misma fila que la plataforma), visible tanto en desktop como en mobile.
- En mobile de 2 columnas (≤600px), el chip muestra solo el icono + nombre muy corto para no desbordar.
- Si el juego está prestado **y** a la venta a la vez, ambos indicadores conviven: el chip de préstamo con texto y el icono de venta sin texto.
- Filtro **"Prestados"** en la colección para ver todos los juegos actualmente fuera de la estantería.

#### Historial

El historial completo de préstamos (quién lo tuvo y cuándo) se mostrará en la **página de detalle del juego**.

#### Modelo de datos

Nueva tabla `game_loans`:

```sql
CREATE TABLE game_loans (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_game_id UUID  NOT NULL REFERENCES user_games(id) ON DELETE CASCADE,
  loaned_to    TEXT  NOT NULL,         -- v1: texto libre; v2: puede coexistir con friend_id
  loaned_at    DATE  NOT NULL DEFAULT CURRENT_DATE,
  returned_at  DATE,                  -- NULL mientras siga prestado
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

El préstamo activo es la fila con `returned_at IS NULL`. Si hay más de una fila es el historial.

RLS: solo el propietario del `user_game` puede leer y escribir sus préstamos.

---

## Media prioridad

### Historial de ventas (`/games/sold`)

Página que muestra los juegos ya vendidos (aquellos con `sold_at IS NOT NULL`). Derivada de la feature de venta, que ya está implementada — los datos existen, solo falta la vista.

#### UI

- Accesible desde un filtro en la colección o ruta directa `/games/sold`.
- Cards estilo lista (no grid), más compactas, orientadas a la información:
  - Portada pequeña + título + plataforma.
  - Precio pagado originalmente → precio de venta final (y la diferencia si se quiere mostrar).
  - Fecha de venta.
- Sin acciones — es solo consulta. Útil para no repetir juegos ya vendidos o para recordar a cuánto se vendió.

---

### Integración RAWG en detalle de juego

La página de detalle ya muestra todos los datos personales de `user_games`. Queda integrar los datos externos de RAWG para juegos con `rawg_id`.

#### Sección RAWG (datos de `game_catalog` + llamadas a la API)

- Descripción completa
- Rating RAWG, puntuación Metacritic, clasificación ESRB
- Plataformas disponibles, géneros, desarrolladores, publishers
- Screenshots (carrusel)
- Tiendas donde comprarlo con links directos
- DLCs disponibles
- Juegos de la misma saga

#### Implementación

- Los datos que no están en `game_catalog` (DLCs, saga, tiendas con links) se piden en paralelo al endpoint de RAWG usando el `rawg_id` del juego:
  - `/games/{id}` — descripción completa, tiendas, ESRB
  - `/games/{id}/screenshots` — capturas
  - `/games/{id}/additions` — DLCs
- Si el juego es `source = 'manual'` (sin `rawg_id`), ocultar las secciones de RAWG.
- Cachear las respuestas de RAWG en memoria durante la sesión.

---

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

## Baja prioridad

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

### ~~Página de detalle de juego (`/games/:id`) — sección personal~~ ✅

Página con ruta propia `/games/:id`. La card navega a la página de detalle en lugar de abrir directamente el formulario de edición. La página muestra todos los datos personales del juego (estado, plataforma, formato, condición, precio, tienda, valoración, notas, fechas) junto con los botones de editar, eliminar y gestión de venta. La integración RAWG (descripción, screenshots, etc.) queda pendiente — ver [Integración RAWG en detalle de juego](#integración-rawg-en-detalle-de-juego).

---

### ~~Juegos a la venta~~ ✅

Toggle **"Gestionar venta"** desde la página de detalle del juego. Permite marcar un juego como disponible para vender con precio de venta deseado, y registrar la venta final con precio obtenido y fecha. Al registrar la venta el juego desaparece de la colección activa. Chip `sell` en la card indicando que el juego está a la venta, con precio si lo tiene. Filtro **"En venta"** en la colección. La vista de historial de ventas queda pendiente — ver [Historial de ventas](#historial-de-ventas-gamessold).

---

### ~~Rediseño mobile de wishlist~~ ✅

Vista de detalle de item en pantalla completa en lugar de bottom sheet para mobile (≤768px portrait). Navegación con back button integrado. Scroll corregido para que el último item sea completamente visible.
