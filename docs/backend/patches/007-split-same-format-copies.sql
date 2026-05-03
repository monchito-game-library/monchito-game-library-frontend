-- ============================================================
-- Patch 007 — Modelo obra/copia · refinar identidad
-- ============================================================
-- Corrige una asunción incorrecta del refactor obra/copia: la regla
-- "una obra agrupa copias del mismo (user, catalog, platform)" colapsaba
-- en una sola obra dos copias del MISMO formato (p.ej. dos físicas con
-- distintas ediciones), lo cual hacía que compartieran status/rating/
-- favorito sin sentido (Castlevania PS3 Standard + Special Edition JAP).
--
-- Regla refinada: una obra agrupa copias del mismo (user, catalog,
-- platform) ÚNICAMENTE cuando tienen formatos distintos (físico +
-- digital). Dos físicas del mismo juego/plataforma → DOS obras.
--
-- Cambios:
--   1. Drop del unique index user_works_unique_per_user_catalog_platform
--      (la identidad ya no es única por esa terna; el matching se hace
--      en el repo aplicando la nueva regla).
--   2. Split: para cada user_works con >1 copia activa del mismo
--      formato, dejar la primera (más antigua) y mover las demás a
--      user_works recién creados, clonando los atributos de obra
--      (status, rating, favorito) de la work original.
--
-- Plan: docs/plans/work-copy-model.md (refinamiento post-fase 4).
-- ============================================================


-- 1. Drop del unique index
DROP INDEX IF EXISTS user_works_unique_per_user_catalog_platform;


-- 2. Split de copias del mismo formato dentro de un mismo work
DO $$
DECLARE
  rec RECORD;
  new_work_id UUID;
BEGIN
  FOR rec IN
    WITH ranked AS (
      SELECT id, work_id, format,
             ROW_NUMBER() OVER (PARTITION BY work_id, format ORDER BY created_at ASC) AS rn
      FROM   user_games
      WHERE  sold_at IS NULL
    )
    SELECT id AS user_game_id, work_id AS old_work_id
    FROM   ranked
    WHERE  rn > 1
    ORDER  BY user_game_id
  LOOP
    INSERT INTO user_works (user_id, game_catalog_id, platform, status, personal_rating, is_favorite)
    SELECT user_id, game_catalog_id, platform, status, personal_rating, is_favorite
    FROM   user_works
    WHERE  id = rec.old_work_id
    RETURNING id INTO new_work_id;

    UPDATE user_games SET work_id = new_work_id WHERE id = rec.user_game_id;
  END LOOP;
END
$$;


-- Verificación opcional: tras este patch no debe quedar ningún work
-- con dos copias activas del mismo formato.
DO $$
DECLARE
  bad_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bad_count
  FROM (
    SELECT 1 FROM user_games WHERE sold_at IS NULL
    GROUP BY work_id, format HAVING COUNT(*) > 1
  ) x;

  IF bad_count > 0 THEN
    RAISE EXCEPTION 'Quedan % works con copias duplicadas del mismo formato tras el split', bad_count;
  END IF;
END
$$;
