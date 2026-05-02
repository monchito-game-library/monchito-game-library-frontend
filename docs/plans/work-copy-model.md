# Plan — Modelo obra/copia (B1 del plan UI/UX 2026)

> Este documento define la migración del modelo de "una entrada por copia" al modelo "obra → copias". Es la mejora más grande del plan; concentra cambios en schema Supabase, repositorios, mappers, modelos TS, use cases y presentation.

---

## ✅ Estado: implementado (mayo 2026)

El refactor está completo. Resumen de lo entregado:

| Fase | Patches SQL | Resultado |
|---|---|---|
| 1 — Schema base | `003-work-copy-schema.sql` | Tabla `user_works`, `work_id` en `user_games`, backfill, trigger puente. |
| 2 — Repo + mappers + vista | `004-vista-obra-copia.sql` | `user_games_full` hace JOIN con `user_works`. Mappers leen status/rating/favorite/platform desde la obra. Repo escribe campos de obra en `user_works`. |
| · Fix imagen | `005-fix-coalesce-image.sql` | `COALESCE(custom_image_url, gc.image_url)` restaurado en la vista. |
| 3 — Domain layer | (sólo TS) | `WorkRepositoryContract`, `SupabaseWorkRepository`, `WorkUseCases`. |
| 4 — Cleanup | `006-cleanup-obsolete-columns.sql` | Drop trigger puente, drop columnas obsoletas y huérfanas, nuevo unique index `(work_id, format, edition)`, reescritura de la vista. Trigger AFTER DELETE para limpiar `user_works` huérfanos. |
| · Refinamiento | `007-split-same-format-copies.sql` | Identidad de obra refinada: agrupa copias del mismo `(user, catalog, platform)` **solo si tienen formatos distintos** (físico + digital). Dos físicas o dos digitales son obras distintas. Drop del unique `user_works_unique_per_user_catalog_platform`. |
| · Cleanup retroactivo | `008-cleanup-orphan-works.sql` | Limpia `user_works` huérfanos creados antes de existir el trigger AFTER DELETE. |

**Fase de UX entregada en la misma rama** (post-B1 según ROADMAP): A4 (action menu + sale banner), C2 (tabs físico/digital + "Mi opinión" arriba), C3 (CTA "Añadir otra copia"), C1 simplificado (listado agrupado por obra con regla físico > digital, sin badge ni toggle).

**Cambios respecto al plan original** que conviene tener en cuenta:
- §2 / §3.1 — la **identidad de obra** ya NO es estrictamente única por `(user_id, game_catalog_id, platform)`. Se permite que coexistan varios `user_works` con la misma terna si tienen copias de formatos incompatibles entre sí (caso real: dos físicas con distintas ediciones de Castlevania PS3 → dos obras separadas, no una compartida). El matching se hace en el repositorio (`_getOrCreateUserWork`).
- §3.4 — sí se dropearon los huérfanos (`personal_review`, `tags_personal`, `started_date`, `completed_date`, `purchased_date`) en patch 006.
- §6 — se acordó "una sola PR al final" pero la rama acumula cada fase como commits separados (más fácil de revisar). PR único al cerrar.

---

## 1. Motivación

Hoy cada copia de un juego es una fila independiente en `user_games`. Si tengo un mismo juego en **PS4 físico** y **PS4 digital**, son dos `user_games` que comparten `game_catalog_id`, `rawg_id` y plataforma, pero no se "saben" entre sí.

Consecuencias visibles:

- Aparecen **dos cards** en el listado para el mismo juego en la misma plataforma, induciendo a pensar que son juegos distintos.
- Se pueden poner los **dos en estado "platino"** — imposible en la realidad: una vez platinado en una plataforma, no se puede volver a platinar en esa misma plataforma con otro soporte.
- La **valoración personal** y las **notas largas** se duplican: cambian en una copia y la otra queda desincronizada (el usuario espera una única opinión sobre la obra).
- El **detalle del juego no muestra el desglose** de qué tienes en físico y qué en digital con sus precios, tiendas y ediciones individuales.

## 2. Modelo conceptual

Introducimos el concepto de **obra (work)**. Una obra agrupa 1..N **copias** que el usuario posee del mismo juego canónico **en la misma plataforma**. Tener PS4 físico + PS4 digital = dos copias de la misma obra. Tener PS4 + Xbox = **dos obras distintas** (los logros y el platino están ligados a la plataforma).

| Campo | Vive en | Razón |
|---|---|---|
| Status (backlog / playing / completed / platinum / abandoned) | **work** | Solo puede haber un platino por obra (juego + plataforma) |
| Personal rating | **work** | Tu opinión es de la obra, no del soporte |
| Favorito | **work** | Es una característica de la obra, no de la copia |
| Started / completed date | **work** | Marcas de progreso ligadas al estado |
| **Plataforma** | **work** | Identifica la obra: PS4 ≠ Xbox; los logros y el platino dependen de ella |
| Formato (digital / physical) | copy | Es lo que distingue copias dentro de una obra: PS4 disco vs PS4 digital |
| Edición | copy | "GOTY", "Deluxe"… puede variar entre copias |
| Precio, tienda, condición, fecha de compra | copy | Cada copia tiene su propia compra |
| Préstamo activo | copy *(solo física)* | |
| `for_sale` / `sale_price` / `sold_at` / `sold_price_final` | copy | Vendes una copia, no la obra |
| `cover_position` | copy *(ya está así)* | Cada copia mantiene su punto focal |
| `custom_image_url` | copy *(ya está así)* | Bug RAWG ya resuelto previamente |
| `description` (notas) | copy | Decisión: una sola descripción por copia. Las dos copias del mismo work pueden tener notas distintas si hace falta ("esta copia tiene la caja dañada"). |

**Identidad del work** (refinada, ver §10): se agrupan en una misma obra las copias que comparten `(user_id, game_catalog_id, platform)` **siempre que sean de formatos distintos** (una física + una digital). Dos copias del mismo formato (p.ej. dos físicas con distintas ediciones) viven en obras separadas y no comparten status/rating/favorito. La regla se aplica en el repositorio (`_getOrCreateUserWork`), no como constraint SQL: el unique index original sobre la terna `(user, catalog, platform)` se dropeó en el patch 007.

## 3. Schema Supabase

### 3.1. Nueva tabla `user_works`

```sql
CREATE TABLE IF NOT EXISTS user_works (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,

  -- Atributos de la obra (no de la copia)
  status TEXT DEFAULT 'backlog' CHECK (status IN (
    'wishlist', 'backlog', 'playing', 'completed', 'platinum', 'abandoned', 'owned'
  )),
  personal_rating  NUMERIC(3,1) CHECK (personal_rating >= 0 AND personal_rating <= 10),
  is_favorite      BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Una obra por (user, juego del catálogo, plataforma). PS4 + Xbox del mismo juego son dos obras distintas.
CREATE UNIQUE INDEX IF NOT EXISTS user_works_unique_per_user_catalog_platform
  ON user_works(user_id, game_catalog_id, platform);

CREATE INDEX IF NOT EXISTS idx_user_works_user_id      ON user_works(user_id);
CREATE INDEX IF NOT EXISTS idx_user_works_platform     ON user_works(platform);
CREATE INDEX IF NOT EXISTS idx_user_works_status       ON user_works(status);
CREATE INDEX IF NOT EXISTS idx_user_works_is_favorite  ON user_works(is_favorite) WHERE is_favorite = TRUE;
```

RLS análoga a `user_games`: solo el `user_id` puede leer/escribir su fila.

### 3.2. Nueva FK en `user_games`

```sql
ALTER TABLE user_games
  ADD COLUMN IF NOT EXISTS work_id UUID REFERENCES user_works(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_user_games_work_id ON user_games(work_id);
```

### 3.3. Backfill atómico

```sql
-- 1. Verificación previa: confirmar que no quedan filas con platform NULL antes del backfill
--    (la INSERT siguiente las descartaría con WHERE platform IS NOT NULL y luego SET NOT NULL fallaría).
SELECT COUNT(*) FROM user_games WHERE platform IS NULL;
-- Si > 0, asignar manualmente platform o purgar esas filas antes de continuar.

-- 2. Crear una user_works por cada (user_id, game_catalog_id, platform) ya existente, copiando los
--    atributos de obra desde la PRIMERA copia (la de menor created_at; las demás son alias en el
--    mismo juego + plataforma).
INSERT INTO user_works (user_id, game_catalog_id, platform, status, personal_rating,
                        is_favorite, created_at, updated_at)
SELECT DISTINCT ON (user_id, game_catalog_id, platform)
  user_id, game_catalog_id, platform, status, personal_rating,
  is_favorite, created_at, updated_at
FROM user_games
WHERE platform IS NOT NULL
ORDER BY user_id, game_catalog_id, platform, created_at ASC
ON CONFLICT (user_id, game_catalog_id, platform) DO NOTHING;

-- 3. Asignar work_id a cada user_games existente.
UPDATE user_games ug
SET    work_id = uw.id
FROM   user_works uw
WHERE  ug.user_id          = uw.user_id
  AND  ug.game_catalog_id  = uw.game_catalog_id
  AND  ug.platform         = uw.platform
  AND  ug.work_id IS NULL;

-- 4. Si quedan user_games sin platform (datos antiguos) que no tengan work asignado, decidir caso a
--    caso antes de poner NOT NULL. La opción razonable es asignarles una platform `unknown` y crear
--    su user_works correspondiente, o limpiarlos si son basura.

-- 5. Una vez verificado el backfill, hacer la columna NOT NULL.
ALTER TABLE user_games ALTER COLUMN work_id SET NOT NULL;
```

### 3.4. Columnas obsoletas y trigger puente — fase de cleanup

Tras la fase 1 (`feat/work-copy-schema`) la BD queda con:

- columnas `status`, `personal_rating`, `is_favorite`, `platform` duplicadas entre `user_games` y `user_works` (ambas con el mismo valor por backfill);
- columnas huérfanas `personal_review`, `tags_personal`, `started_date`, `completed_date`, `purchased_date` (auditoría 2026-05-02: 423 filas en `user_games`, 0 con datos en estas cinco columnas);
- el unique index `user_games_unique_per_platform` (por `platform`) sigue activo;
- la vista `user_games_full` sigue leyendo todo desde `user_games`;
- un **trigger puente** `trg_user_games_ensure_work_id` (función `public.ensure_user_work_id`) que asigna `work_id` automáticamente cuando un INSERT no lo trae — añadido en el patch 003 para que el frontend antiguo siga funcionando entre fase 1 y fase 2.

La **fase 4 (`feat/work-copy-cleanup`)** se ejecuta cuando el repositorio ya manda `work_id` explícito en cada INSERT y los mappers leen de `user_works`. Su patch SQL:

```sql
-- Drop columnas obsoletas (ya viven en user_works) + huérfanas
ALTER TABLE user_games
  DROP COLUMN status,
  DROP COLUMN personal_rating,
  DROP COLUMN is_favorite,
  DROP COLUMN platform,           -- platform ahora vive en user_works
  DROP COLUMN personal_review,    -- huérfano: nunca llegó al mapper ni a la UI
  DROP COLUMN tags_personal,      -- huérfano
  DROP COLUMN started_date,       -- huérfano
  DROP COLUMN completed_date,     -- huérfano
  DROP COLUMN purchased_date;     -- huérfano

-- Drop del trigger puente: el repositorio nuevo manda work_id explícito.
-- (La función referencia status/personal_rating/is_favorite, así que hay que dropear el
-- trigger ANTES de dropear las columnas. Se hace primero por orden de dependencia.)
DROP TRIGGER  IF EXISTS trg_user_games_ensure_work_id ON user_games;
DROP FUNCTION IF EXISTS public.ensure_user_work_id();

-- Reemplazar el unique index actual (incluía platform) por uno limitado a (work_id, format, edition),
-- que es lo que ahora distingue copias dentro de una obra:
DROP INDEX IF EXISTS user_games_unique_per_platform;
CREATE UNIQUE INDEX IF NOT EXISTS user_games_unique_per_work_format_edition
  ON user_games(work_id, format, edition)
  WHERE sold_at IS NULL;

-- Reescribir la vista user_games_full para leer status/rating/favorite/platform desde user_works
-- (ver §3.5 para el SELECT completo).
```

Orden importante: dropear el trigger **antes** de dropear las columnas, porque la función referencia `NEW.status`, `NEW.personal_rating` y `NEW.is_favorite`.

### 3.5. Vistas actualizadas

`user_games_full` se reescribe para hacer `JOIN` con `user_works` y exponer los campos desde donde corresponden:

```sql
DROP VIEW IF EXISTS user_games_full;
CREATE VIEW user_games_full WITH (security_invoker = on) AS
SELECT
  ug.id,
  ug.user_id,
  ug.game_catalog_id,
  ug.work_id,

  -- Catálogo
  gc.rawg_id, gc.title, gc.slug, gc.description, gc.image_url,
  gc.released_date, gc.rating AS rawg_rating, gc.metacritic_score,
  gc.esrb_rating, gc.platforms AS available_platforms,
  gc.parent_platforms, gc.genres, gc.tags,
  gc.developers, gc.publishers, gc.source,

  -- Atributos de obra (vienen de user_works) — platform ahora también vive aquí
  uw.platform        AS user_platform,
  uw.status,
  uw.personal_rating,
  uw.is_favorite,

  -- Atributos de copia (siguen en user_games)
  ug.price, ug.store,
  ug.condition, ug.format,
  ug.edition, ug.description AS user_notes, ug.cover_position, ug.custom_image_url,
  ug.for_sale, ug.sale_price, ug.sold_at, ug.sold_price_final,

  al.id AS active_loan_id, al.loaned_to AS active_loan_to, al.loaned_at AS active_loan_at,

  ug.created_at, ug.updated_at
FROM user_games ug
JOIN game_catalog gc ON ug.game_catalog_id = gc.id
JOIN user_works   uw ON ug.work_id          = uw.id
LEFT JOIN LATERAL (
  SELECT id, loaned_to, loaned_at
  FROM   game_loans
  WHERE  user_game_id = ug.id AND returned_at IS NULL
  LIMIT  1
) al ON TRUE;
```

Vistas dependientes (`available_items`, `sold_items`) seguirán funcionando porque consumen `user_games_full`.

## 4. Modelos TypeScript

### 4.1. Nuevo `WorkModel` (capa entities/models/work)

```typescript
export interface WorkModel {
  id: string;                       // UUID de user_works
  userId: string;
  gameCatalogId: string;
  platform: PlatformType;
  status: GameStatus;
  personalRating: number | null;
  isFavorite: boolean;
}
```

### 4.2. `GameModel` y `GameEditModel` (cambios)

Quitar de la copia y referenciar a la obra. Plataforma sube a la obra:

```diff
 export interface GameEditModel {
   uuid: string;
+  workId: string;
   title: string;            // viene del catálogo, sigue accesible
-  status: GameStatus;       // → vive en WorkModel
-  personalRating: number;   // → vive en WorkModel
-  isFavorite: boolean;      // → vive en WorkModel
-  platform: PlatformType;   // → vive en WorkModel (identifica la obra)
   format: GameFormat;
   price: number;
   ...
 }
```

Las pantallas que necesiten plataforma (game-card, game-list, game-row, game-detail) la leen del `workId` asociado a la copia que están pintando.

`GameListModel` queda con los campos de copia. El listado muestra **una sola copia representativa por work** (regla en §4.4); para el detalle se exponen todas las copias mediante un método dedicado del repositorio (§5).

### 4.3. Capa `data/dtos`

Nuevo `UserWorkRowDTO` con los campos de la tabla. `UserGameRowDTO` pierde los campos de obra y gana `work_id`.

### 4.4. Regla de copia representativa para el listado

- **Las cards del grid representan la copia física de la obra cuando existe.** Si la obra tiene físico + digital, la card muestra los datos del físico (precio, edición, condición, tienda, formato físico…).
- Si la obra **solo tiene copia digital**, la card muestra los datos del digital, igual que hoy.
- En el **detalle** de la obra se ve el desglose completo: cada copia (físico y/o digital) con sus propios precios, tiendas, ediciones y datos de compra. Los campos de obra (status, rating, favorito, review, tags) son únicos y se muestran una sola vez.

**Implicación técnica:**
- El repositorio devuelve para el listado una proyección donde por cada `work_id` selecciona **una sola copia representativa**: prioridad `physical` > `digital`; en empate, la de menor `created_at`.
- En SQL puede formalizarse con `DISTINCT ON (work_id) ... ORDER BY work_id, (format = 'physical') DESC, created_at ASC`. La cláusula `(format = 'physical') DESC` evalúa primero los `true` (físicos), después los `false` (digitales).
- Esta proyección es **solo** para el listado/cards. El detalle, los formularios de edición y el flujo de venta operan sobre la copia individual; el detalle pide explícitamente todas las copias del work (§5, método nuevo `getCopiesByWork`).

---

## 5. Capas afectadas — orden de refactor

> Riguroso de dentro afuera. Cada paso debe pasar lint + tests antes de pasar al siguiente.

1. **Schema Supabase** — patch SQL (§3.1, 3.2, 3.3, 3.5). Aplicado en local + staging. Verificar manualmente que `user_games_full` devuelve los mismos datos por copia que antes.
2. **DTOs y Mappers** — `user-work.mapper.ts` nuevo; `game.mapper.ts` actualizado para leer status/rating/favorite desde el bloque de obra del row.
3. **Modelos** — `WorkModel` nuevo; ajustar `GameModel`, `GameEditModel`, `GameListModel` (eliminar campos de obra + añadir `workId`).
4. **Repositorios** — `SupabaseGameRepository` se separa o crece:
   - `getAllGamesForList(userId)` devuelve `GameListModel[]` con **una copia representativa por work** (físico > digital; empate por `created_at` ascendente). Implementado con `DISTINCT ON (work_id) … ORDER BY work_id, (format = 'physical') DESC, created_at ASC`.
   - `getCopiesByWork(workId)` (nuevo) devuelve **todas** las copias de una obra. Lo usa el detalle para pintar el desglose físico + digital.
   - `getGameForEdit(uuid)` devuelve `{ work: WorkModel, copy: GameEditModel }` o expone ambos via el composite.
   - `updateWork(workId, fields)` para campos de obra.
   - `updateCopy(uuid, fields)` para campos de copia.
   - `createGame(...)` ahora hace `INSERT user_works` (si la obra no existe para `(user, catalog, platform)`) + `INSERT user_games`.
   - `deleteGame(uuid)` borra la copia. Si era la última copia de la obra → trigger SQL borra `user_works` (CASCADE). En cualquier caso revisar que `ON DELETE CASCADE` está bien orientado.
5. **Use cases** — exponen métodos separados `updateWork`, `updateCopy`, `getWorkWithCopies(workId)`.
6. **DI providers** — añadir `WORK_USE_CASES` o ampliar `GAME_USE_CASES` (decisión por discutir; preferencia: ampliar para no romper imports masivamente).
7. **Presentation** — game-detail, game-form, game-list. **Sin cambios de UX en este PR**; esos vienen en C1, C2 y C3. El detalle por ahora sigue mostrando una sola copia, leyendo work-fields del workId asociado.
8. **Tests**: actualizar fixtures, añadir specs del nuevo mapper y repositorio. Cobertura objetivo no debe bajar.

## 6. Plan de despliegue

**Una sola PR con downtime corto** (decidido). Justificación: la base de usuarios es mínima (yo + Mónica) y mantener fases de coexistencia con vista paralela `user_games_full_v2` añade complejidad y deuda. Si tras el deploy algo no convence, el rollback es revertir el merge en master + restaurar el snapshot de Supabase.

Orden de ejecución dentro del mismo PR:
1. Patch SQL aplicado primero (`npm run db:apply`) — crea `user_works`, backfill, `work_id` NOT NULL, vista nueva, drop de columnas obsoletas.
2. Backend ya devuelve la vista nueva → el frontend se actualiza en el mismo deploy con los nuevos modelos/mappers.

Pre-condiciones del despliegue:
- Snapshot manual de Supabase antes de aplicar el patch (Dashboard → Database → Backups → Create snapshot).
- Confirmar 0 filas con `platform IS NULL` en `user_games` antes del backfill (ver §3.3 paso 1).

## 7. Tests a actualizar

- `mappers/supabase/game.mapper.spec.ts`: ahora el mapper recibe row con bloque de obra; tests de status, rating, favorito reciben las nuevas keys.
- `mappers/supabase/user-work.mapper.spec.ts`: nuevo.
- `repositories/supabase.repository.spec.ts`: `createGame`, `updateGameForUser`, `deleteGame` cambian. Añadir `updateWork`/`updateCopy`.
- `domain/use-cases/game.use-cases.spec.ts`: nuevos métodos.
- Fixtures de game (en `src/testing/`): añadir `workId` y `WorkModel` factory.
- Tests de presentation (game-detail, game-form, game-list, sale-form, game-loan-form): solo si tocan campos de obra directamente.

Cobertura objetivo: ≥ 95.5 % branches (estado actual). El nuevo mapper aporta cobertura adicional.

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Backfill mal interpretado: copias de la misma obra con status distintos en el dato actual | El `DISTINCT ON` toma el de la copia más antigua. Aceptable: ya hoy el usuario solo edita una copia y olvida la otra. Tras el merge, queda una sola fuente de verdad y el "platino duplicado" es imposible. |
| RLS de `user_works` mal configurada | Replicar literalmente las policies de `user_games`, cambiar nombre tabla. Smoke test en staging con dos usuarios. |
| Tests de mappers/repos amplios que rompen en cascada | Refactorizar en pasos pequeños: tras cada layer, ejecutar `npm test` y arreglar fallos antes de continuar. |
| Frontend deja de funcionar durante la migración | Fase 0 mantiene la vista vieja viva. El frontend sigue funcionando hasta que se hace cutover en Fase 1. |
| Vista nueva con `JOIN INNER` falla si un user_games quedó sin work_id | El backfill `UPDATE user_games SET work_id=…` cubre todo lo existente. La fase final `ALTER COLUMN SET NOT NULL` impide nuevas filas sin work_id. |
| Cover position: hoy se guarda en `game_catalog` (compartida entre copias del mismo juego, BUGS.md). | Aprovechar este PR para mover `cover_position` (y `custom_image_url` propuesto) a `user_games`. Cierra el bug latente. |

## 9. Estimación

Ramas pequeñas y aislables, no un PR único enorme:

1. `feat/work-copy-schema` — patch SQL: tabla `user_works`, FK `work_id` en `user_games`, backfill, trigger puente para mantener compat con el frontend antiguo. Sin cambios TS. ~1 sesión.
2. `feat/work-copy-mapper-repo` — DTOs, mappers, repositorio leen de `user_works` y mandan `work_id` en INSERTs. El trigger puente sigue activo por seguridad. Cobertura. ~2 sesiones.
3. `feat/work-copy-models-frontend` — modelos TS, use cases, DI; presentation se actualiza al mínimo (mismo UX, refactor de imports). ~2 sesiones.
4. `feat/work-copy-cleanup` — patch SQL final: drop de columnas obsoletas en `user_games` (`status`, `personal_rating`, `is_favorite`, `platform`, `personal_review`, `tags_personal`, `started_date`, `completed_date`, `purchased_date`), drop del trigger puente y de la función `ensure_user_work_id`, reemplazo del unique index por `(work_id, format, edition)`, reescritura de `user_games_full` con JOIN a `user_works`. Detalle en §3.4 y §3.5. ~1 sesión.

Después: C1, C2, C3 (UI) en ramas separadas.

## 10. Decisiones tomadas

| Decisión | Resultado |
|---|---|
| Migración de un solo PR vs fases con vista paralela | **Una sola PR**. Pocos usuarios, snapshot Supabase + revert si algo falla. |
| `cover_position` y `custom_image_url` movidos a `user_games` (bug RAWG) | **Ya estaban**: el bug se cerró antes. No hay nada que tocar. |
| `tags_personal` (obra o copia o drop) | **Drop**. Auditoría 2026-05-02: 0 filas con datos. Si se necesita en el futuro, se añade cuando haya UI para ello. |
| `personal_review` (obra o drop) | **Drop**. Mismo motivo: 0 filas, sin UI. Solo `description` (en copia) sobrevive como notas. |
| `started_date` / `completed_date` (obra o drop) | **Drop**. 0 filas. Si en el futuro se quiere "completed in 2024", se reañaden a `user_works`. |
| `purchased_date` (copia o drop) | **Drop**. 0 filas. |
