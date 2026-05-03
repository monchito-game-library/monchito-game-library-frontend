-- ============================================================
-- Patch 004 — Modelo obra/copia (B1) · Fase 2: vista user_games_full
-- ============================================================
-- Reescribe la vista user_games_full para que los atributos de obra
-- (status, personal_rating, is_favorite, user_platform) vengan de
-- user_works y no de user_games. Añade work_id al SELECT para que el
-- repositorio pueda usarlo en updates segregados (campos de obra
-- → user_works, campos de copia → user_games).
--
-- Mantiene en la vista los campos huérfanos (purchased_date,
-- personal_review, started_date, completed_date, tags_personal) hasta
-- la fase 4 (cleanup), donde se dropearán de user_games junto con las
-- columnas duplicadas. Mantenerlos aquí evita romper DTOs durante el
-- refactor.
--
-- Tras este patch, ESCRIBIR en user_games.status / .personal_rating /
-- .is_favorite / .platform NO se reflejará en la vista. El repositorio
-- debe escribir esos cuatro campos en user_works.
--
-- Plan: docs/plans/work-copy-model.md §3.5
-- ============================================================

-- DROP CASCADE: la vista tiene dependientes (available_items, sold_items) que
-- se recrean al final del patch sin cambios funcionales.
DROP VIEW IF EXISTS user_games_full CASCADE;

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
  gc.image_url,
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

  -- Huérfanos: mantenidos hasta la fase 4 (drop columnas) para no romper DTOs
  ug.purchased_date,
  ug.personal_review,
  ug.started_date,
  ug.completed_date,
  ug.tags_personal,

  -- Préstamo activo (NULL si no está prestado)
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


-- ------------------------------------------------------------
-- Recrear vistas dependientes (available_items, sold_items)
-- — definiciones idénticas a las del schema canónico, sin cambios.
-- ------------------------------------------------------------

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
