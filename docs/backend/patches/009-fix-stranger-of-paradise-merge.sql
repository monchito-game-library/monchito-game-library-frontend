-- ============================================================
-- Patch 009 — Fix datos: fusionar Stranger of Paradise mal partido
-- ============================================================
-- El botón "Añadir otra copia" sobre una copia con catálogo MANUAL no
-- forzaba el reuso de catalog_id ni de work_id. Al usar RAWG search en
-- el form se creaba un catálogo RAWG nuevo distinto del manual original
-- → _getOrCreateUserWork no encontraba match → creaba una user_works
-- nueva en lugar de añadir la copia digital al work físico existente.
--
-- Estado actual:
--   - catalog 16b944b0 (manual, sin rawg_id) — work 738fb380 (PS4 physical, marzo)
--   - catalog 8eaac04f (rawg_id=619344) — works 9ab2ed76 (PS4 digital, hoy) y e784f15a (PS5 digital, hoy)
--
-- Estado deseado:
--   - catalog 8eaac04f único para todas las copias (es el correcto, tiene rawg_id).
--   - work 738fb380 (PS4) con sus 2 copias (physical de marzo + digital de hoy).
--   - work e784f15a (PS5 digital) intacto (es una obra distinta por platform).
--   - catalog 16b944b0 y work 9ab2ed76 borrados.
--
-- Acciones:
--   1. Migrar work 738fb380 al catalog correcto (8eaac04f).
--   2. Migrar la copia user_games del work físico al catalog correcto.
--   3. Mover la copia digital dac2dc75 del work erróneo al correcto.
--   4. Borrar la work errónea 9ab2ed76 (queda sin copias tras el paso 3).
--   5. Borrar el catalog manual 16b944b0 (queda sin filas que lo usen).
-- ============================================================

-- 1+2. Migrar el work y su copia física del catalog manual al catalog rawg
UPDATE user_works
SET    game_catalog_id = '8eaac04f-ac79-4def-ad8e-62b5b3af847b'
WHERE  id = '738fb380-f8ef-4842-a288-ddbcaadb6c45';

UPDATE user_games
SET    game_catalog_id = '8eaac04f-ac79-4def-ad8e-62b5b3af847b'
WHERE  work_id = '738fb380-f8ef-4842-a288-ddbcaadb6c45';

-- 3. Mover la copia digital al work correcto
UPDATE user_games
SET    work_id = '738fb380-f8ef-4842-a288-ddbcaadb6c45',
       game_catalog_id = '8eaac04f-ac79-4def-ad8e-62b5b3af847b'
WHERE  id = 'dac2dc75-7670-4ce9-8293-5b5842b16977';

-- 4. Borrar la work errónea (ya no tiene copias)
DELETE FROM user_works
WHERE  id = '9ab2ed76-2b08-4868-9dad-d4c8822a8cfe';

-- 5. Borrar el catalog manual obsoleto (ya no tiene filas que lo usen)
DELETE FROM game_catalog
WHERE  id = '16b944b0-7eb1-4128-ba61-fa8c2179e246';

-- Verificación final
DO $$
DECLARE
  copies_in_correct_work INTEGER;
  orphan_works INTEGER;
BEGIN
  SELECT COUNT(*) INTO copies_in_correct_work
  FROM   user_games
  WHERE  work_id = '738fb380-f8ef-4842-a288-ddbcaadb6c45';

  IF copies_in_correct_work <> 2 THEN
    RAISE EXCEPTION 'Esperaba 2 copias en work 738fb380, encontradas %', copies_in_correct_work;
  END IF;

  SELECT COUNT(*) INTO orphan_works
  FROM   user_works uw
  WHERE  NOT EXISTS (SELECT 1 FROM user_games WHERE work_id = uw.id);

  IF orphan_works > 0 THEN
    RAISE EXCEPTION 'Quedan % user_works huérfanos tras la fusión', orphan_works;
  END IF;
END
$$;
