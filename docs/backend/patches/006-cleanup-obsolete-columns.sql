-- ============================================================
-- Patch 006 — Modelo obra/copia (B1) · Fase 4: cleanup
-- ============================================================
-- Limpieza final del refactor obra/copia. Orden importante:
--   1. Drop trigger puente trg_user_games_ensure_work_id + función
--      ensure_user_work_id (la función referencia NEW.status,
--      NEW.personal_rating, NEW.is_favorite — hay que dropearla antes
--      que las columnas).
--   2. Drop vista user_games_full CASCADE (tira available_items y
--      sold_items: se recrean abajo). Necesario antes del DROP COLUMN
--      porque la vista 005 todavía referencia los huérfanos.
--   3. Drop columnas obsoletas (status, personal_rating, is_favorite,
--      platform — viven en user_works) y huérfanas (personal_review,
--      tags_personal, started_date, completed_date, purchased_date —
--      0 filas con datos en la auditoría 2026-05-02).
--   4. Reemplazar el unique index por (work_id, format, edition).
--   5. Recrear user_games_full + available_items + sold_items sin los
--      campos eliminados.
--   6. Trigger AFTER DELETE en user_games que limpia user_works
--      huérfanos (la última copia de una obra borrada elimina la obra).
--
-- Pre-condición: el frontend manda work_id explícito (fase 2 + repo
-- refactor) y los mappers leen status/rating/favorite/platform desde
-- user_works (vía la vista). Validado en pruebas manuales 2026-05-02.
--
-- Plan: docs/plans/work-copy-model.md §3.4
-- ============================================================


-- ------------------------------------------------------------
-- 1. Drop trigger puente y función
-- ------------------------------------------------------------

DROP TRIGGER  IF EXISTS trg_user_games_ensure_work_id ON user_games;
DROP FUNCTION IF EXISTS public.ensure_user_work_id();


-- ------------------------------------------------------------
-- 2. Drop vista (CASCADE → available_items + sold_items)
-- ------------------------------------------------------------

DROP VIEW IF EXISTS user_games_full CASCADE;


-- ------------------------------------------------------------
-- 3. Drop columnas obsoletas y huérfanas
-- ------------------------------------------------------------

ALTER TABLE user_games
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS personal_rating,
  DROP COLUMN IF EXISTS is_favorite,
  DROP COLUMN IF EXISTS platform,
  DROP COLUMN IF EXISTS personal_review,
  DROP COLUMN IF EXISTS tags_personal,
  DROP COLUMN IF EXISTS started_date,
  DROP COLUMN IF EXISTS completed_date,
  DROP COLUMN IF EXISTS purchased_date;


-- ------------------------------------------------------------
-- 4. Reemplazar unique index
-- ------------------------------------------------------------

DROP INDEX IF EXISTS user_games_unique_per_platform;

CREATE UNIQUE INDEX IF NOT EXISTS user_games_unique_per_work_format_edition
  ON user_games(work_id, format, edition)
  WHERE sold_at IS NULL;


-- ------------------------------------------------------------
-- 5. Recrear vista user_games_full + dependientes
-- ------------------------------------------------------------

CREATE VIEW user_games_full WITH (security_invoker = on) AS
SELECT
  ug.id,
  ug.user_id,
  ug.game_catalog_id,
  ug.work_id,

  -- Catálogo (game_catalog)
  gc.rawg_id,
  gc.title,
  gc.slug,
  gc.description,
  COALESCE(ug.custom_image_url, gc.image_url) AS image_url,
  gc.released_date,
  gc.rating          AS rawg_rating,
  gc.metacritic_score,
  gc.esrb_rating,
  gc.platforms       AS available_platforms,
  gc.parent_platforms,
  gc.genres,
  gc.tags,
  gc.developers,
  gc.publishers,
  gc.source,

  -- Atributos de obra (user_works)
  uw.platform        AS user_platform,
  uw.status,
  uw.personal_rating,
  uw.is_favorite,

  -- Atributos de copia (user_games)
  ug.price,
  ug.store,
  ug.condition,
  ug.format,
  ug.edition,
  ug.description     AS user_notes,
  ug.cover_position,
  ug.custom_image_url,
  ug.for_sale,
  ug.sale_price,
  ug.sold_at,
  ug.sold_price_final,

  -- Préstamo activo
  al.id          AS active_loan_id,
  al.loaned_to   AS active_loan_to,
  al.loaned_at   AS active_loan_at,

  ug.created_at,
  ug.updated_at
FROM user_games ug
JOIN game_catalog gc ON ug.game_catalog_id = gc.id
JOIN user_works   uw ON ug.work_id         = uw.id
LEFT JOIN LATERAL (
  SELECT id, loaned_to, loaned_at
  FROM   game_loans
  WHERE  user_game_id = ug.id
    AND  returned_at IS NULL
  LIMIT  1
) al ON TRUE;


CREATE OR REPLACE VIEW available_items AS
  SELECT
    ug.id::TEXT                                       AS id,
    'game'::TEXT                                      AS item_type,
    ug.title                                          AS item_name,
    NULL::TEXT                                        AS brand_name,
    NULL::TEXT                                        AS model_name,
    ug.edition                                        AS detail_left,
    ug.user_platform                                  AS detail_right,
    ug.sale_price                                     AS sale_price,
    ug.user_id                                        AS user_id,
    ug.created_at                                     AS created_at
  FROM user_games_full ug
  WHERE ug.for_sale = TRUE AND ug.sold_at IS NULL

  UNION ALL

  SELECT
    uc.id::TEXT                                       AS id,
    'console'::TEXT                                   AS item_type,
    hm.name                                           AS item_name,
    hb.name                                           AS brand_name,
    NULL::TEXT                                        AS model_name,
    uc.region                                         AS detail_left,
    hb.name                                           AS detail_right,
    uc.sale_price                                     AS sale_price,
    uc.user_id                                        AS user_id,
    uc.created_at                                     AS created_at
  FROM user_consoles uc
  JOIN hardware_models hm ON hm.id = uc.model_id
  JOIN hardware_brands hb ON hb.id = uc.brand_id
  WHERE uc.for_sale = TRUE AND uc.sold_at IS NULL

  UNION ALL

  SELECT
    uct.id::TEXT                                      AS id,
    'controller'::TEXT                                AS item_type,
    hm.name                                           AS item_name,
    hb.name                                           AS brand_name,
    NULL::TEXT                                        AS model_name,
    uct.compatibility                                 AS detail_left,
    hb.name                                           AS detail_right,
    uct.sale_price                                    AS sale_price,
    uct.user_id                                       AS user_id,
    uct.created_at                                    AS created_at
  FROM user_controllers uct
  JOIN hardware_models hm ON hm.id = uct.model_id
  JOIN hardware_brands hb ON hb.id = uct.brand_id
  WHERE uct.for_sale = TRUE AND uct.sold_at IS NULL;

ALTER VIEW available_items SET (security_invoker = true);


CREATE OR REPLACE VIEW sold_items AS
  SELECT
    ug.id::TEXT                                       AS id,
    'game'::TEXT                                      AS item_type,
    ug.title                                          AS item_name,
    NULL::TEXT                                        AS brand_name,
    NULL::TEXT                                        AS model_name,
    ug.edition                                        AS detail_left,
    ug.user_platform                                  AS detail_right,
    ug.sold_price_final                               AS sold_price_final,
    ug.sold_at                                        AS sold_at,
    ug.user_id                                        AS user_id,
    ug.created_at                                     AS created_at
  FROM user_games_full ug
  WHERE ug.sold_at IS NOT NULL

  UNION ALL

  SELECT
    uc.id::TEXT                                       AS id,
    'console'::TEXT                                   AS item_type,
    hm.name                                           AS item_name,
    hb.name                                           AS brand_name,
    NULL::TEXT                                        AS model_name,
    uc.region                                         AS detail_left,
    hb.name                                           AS detail_right,
    uc.sold_price_final                               AS sold_price_final,
    uc.sold_at                                        AS sold_at,
    uc.user_id                                        AS user_id,
    uc.created_at                                     AS created_at
  FROM user_consoles uc
  JOIN hardware_models hm ON hm.id = uc.model_id
  JOIN hardware_brands hb ON hb.id = uc.brand_id
  WHERE uc.sold_at IS NOT NULL

  UNION ALL

  SELECT
    uct.id::TEXT                                      AS id,
    'controller'::TEXT                                AS item_type,
    hm.name                                           AS item_name,
    hb.name                                           AS brand_name,
    NULL::TEXT                                        AS model_name,
    uct.compatibility                                 AS detail_left,
    hb.name                                           AS detail_right,
    uct.sold_price_final                              AS sold_price_final,
    uct.sold_at                                       AS sold_at,
    uct.user_id                                       AS user_id,
    uct.created_at                                    AS created_at
  FROM user_controllers uct
  JOIN hardware_models hm ON hm.id = uct.model_id
  JOIN hardware_brands hb ON hb.id = uct.brand_id
  WHERE uct.sold_at IS NOT NULL;

ALTER VIEW sold_items SET (security_invoker = true);


-- ------------------------------------------------------------
-- 6. Trigger AFTER DELETE: limpiar user_works huérfanos
-- ------------------------------------------------------------
-- La FK actual user_games.work_id ON DELETE CASCADE cubre el caso
-- "borrar la obra elimina todas las copias". Para el contrario
-- (borrar la última copia debe eliminar la obra), añadimos este trigger.

CREATE OR REPLACE FUNCTION public.cleanup_orphan_user_works()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_games WHERE work_id = OLD.work_id
  ) THEN
    DELETE FROM public.user_works WHERE id = OLD.work_id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_games_cleanup_orphan_works ON user_games;
CREATE TRIGGER trg_user_games_cleanup_orphan_works
  AFTER DELETE ON user_games
  FOR EACH ROW EXECUTE FUNCTION public.cleanup_orphan_user_works();
