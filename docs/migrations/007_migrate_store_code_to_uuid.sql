-- Migration 007: replace store code (text) with UUID reference in user_games
-- and clean up stores table (remove is_system, remove code, add created_by).
--
-- Run this migration BEFORE deploying the new app version.
-- Safe to run multiple times (uses IF EXISTS / IF NOT EXISTS guards).

BEGIN;

-- ─── 1. stores: add created_by, drop is_system ───────────────────────────────

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE stores DROP COLUMN IF EXISTS is_system;

-- ─── 2. user_games: add temporary store_id UUID column ───────────────────────

ALTER TABLE user_games
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE SET NULL;

-- ─── 3. Drop view before altering user_games columns ────────────────────────

DROP VIEW IF EXISTS user_games_full;

-- ─── 4. Migrate existing store codes → UUIDs ─────────────────────────────────
-- Games with store='none' or unmatched codes are left as NULL (no store).

UPDATE user_games ug
SET store_id = s.id
FROM stores s
WHERE s.code = ug.store
  AND ug.store IS NOT NULL
  AND ug.store <> 'none';

-- ─── 5. Drop old store (text) column, rename store_id ────────────────────────

ALTER TABLE user_games DROP COLUMN IF EXISTS store;
ALTER TABLE user_games RENAME COLUMN store_id TO store;

-- ─── 6. stores: drop code column ─────────────────────────────────────────────
-- Must happen AFTER step 4 so the code lookup above still works.

ALTER TABLE stores DROP COLUMN IF EXISTS code;

-- ─── 7. Recreate user_games_full view ────────────────────────────────────────
-- store column now returns a UUID (or NULL) instead of a text code.

DROP VIEW IF EXISTS user_games_full;

CREATE VIEW user_games_full AS
SELECT
  ug.id,
  ug.user_id,
  ug.game_catalog_id,
  gc.rawg_id,
  gc.title,
  gc.slug,
  gc.description,
  gc.image_url,
  gc.released_date,
  gc.rating         AS rawg_rating,
  gc.metacritic_score,
  gc.esrb_rating,
  gc.platforms      AS available_platforms,
  gc.parent_platforms,
  gc.genres,
  gc.tags,
  gc.developers,
  gc.publishers,
  gc.source,
  ug.price,
  ug.store,
  ug.platform       AS user_platform,
  ug.condition,
  ug.purchased_date,
  ug.status,
  ug.platinum,
  ug.edition,
  ug.format,
  ug.personal_rating,
  ug.personal_review,
  ug.description    AS user_notes,
  ug.is_favorite,
  ug.created_at,
  ug.updated_at
FROM user_games ug
JOIN game_catalog gc ON ug.game_catalog_id = gc.id;

COMMIT;
