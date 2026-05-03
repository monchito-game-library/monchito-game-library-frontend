-- ============================================================
-- Patch 010 — Cleanup de game_catalog (huérfanos + counters + sync work)
-- ============================================================
-- Tras meses de uso, game_catalog acumuló:
--   • Filas huérfanas (sin user_games ni user_wishlist apuntándolas) por
--     selecciones de RAWG search que el usuario abandonó sin guardar y
--     por catálogos manuales del flujo antiguo (pre-fix de "Añadir otra
--     copia" en patch 009).
--   • Contadores `times_added_by_users` desincronizados respecto a la
--     cuenta real. El trigger increment/decrement no se aplicó en
--     borrados manuales antiguos.
--   • Inconsistencias entre user_games.game_catalog_id y
--     user_works.game_catalog_id: la edición de un juego con catalogEntry
--     RAWG nuevo actualiza el catalog en user_games pero no en user_works
--     (residuo del flujo original de updateGameForUser).
--
-- Acciones:
--   1. Sincronizar user_works.game_catalog_id con el de su user_games
--      asociado. Resuelve las 3 inconsistencias detectadas: Scarlet Nexus,
--      Sleeping Dogs Definitive Edition y Tails of Iron — sus user_works
--      apuntaban al catalog manual antiguo mientras user_games ya estaba
--      migrado al catalog RAWG correcto.
--   2. DELETE de catálogos sin ninguna fila en user_games, user_wishlist
--      ni user_works.
--   3. UPDATE de times_added_by_users con la cuenta real de user_games
--      por catálogo.
-- ============================================================

-- 1. Sincronizar user_works.game_catalog_id con su user_games (toma el del
--    user_games más antiguo de cada work).
WITH correct_cat AS (
  SELECT DISTINCT ON (work_id) work_id, game_catalog_id
  FROM   user_games
  ORDER  BY work_id, created_at ASC
)
UPDATE user_works uw
SET    game_catalog_id = c.game_catalog_id
FROM   correct_cat c
WHERE  uw.id = c.work_id
  AND  uw.game_catalog_id <> c.game_catalog_id;

-- 2. Borrar catálogos huérfanos (sin user_games, user_wishlist NI user_works)
DELETE FROM game_catalog
WHERE NOT EXISTS (SELECT 1 FROM user_games    ug WHERE ug.game_catalog_id = game_catalog.id)
  AND NOT EXISTS (SELECT 1 FROM user_wishlist uw WHERE uw.game_catalog_id = game_catalog.id)
  AND NOT EXISTS (SELECT 1 FROM user_works    uk WHERE uk.game_catalog_id = game_catalog.id);

-- 3. Resync del contador
UPDATE game_catalog gc
SET    times_added_by_users = (
  SELECT COUNT(*) FROM user_games ug WHERE ug.game_catalog_id = gc.id
);

-- Verificación
DO $$
DECLARE
  orphans  INTEGER;
  desynced INTEGER;
  inconsistencies INTEGER;
BEGIN
  SELECT COUNT(*) INTO inconsistencies FROM user_games ug
  JOIN   user_works uw ON ug.work_id = uw.id
  WHERE  ug.game_catalog_id <> uw.game_catalog_id;

  SELECT COUNT(*) INTO orphans FROM game_catalog gc
  WHERE NOT EXISTS (SELECT 1 FROM user_games    WHERE game_catalog_id = gc.id)
    AND NOT EXISTS (SELECT 1 FROM user_wishlist WHERE game_catalog_id = gc.id)
    AND NOT EXISTS (SELECT 1 FROM user_works    WHERE game_catalog_id = gc.id);

  SELECT COUNT(*) INTO desynced FROM game_catalog gc
  WHERE gc.times_added_by_users IS NOT NULL
    AND gc.times_added_by_users <> (SELECT COUNT(*) FROM user_games ug WHERE ug.game_catalog_id = gc.id);

  IF inconsistencies > 0 THEN
    RAISE EXCEPTION 'Quedan % user_games con catalog_id distinto al de su user_works', inconsistencies;
  END IF;
  IF orphans > 0 THEN
    RAISE EXCEPTION 'Quedan % catálogos huérfanos tras el cleanup', orphans;
  END IF;
  IF desynced > 0 THEN
    RAISE EXCEPTION 'Quedan % catálogos con times_added_by_users desincronizado', desynced;
  END IF;
END
$$;
