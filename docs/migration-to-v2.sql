-- ============================================
-- MIGRACIÓN DE ESQUEMA V1 → V2
-- ============================================
-- Este script migra datos de la tabla 'games' antigua
-- al nuevo esquema con 'game_catalog' y 'user_games'

-- IMPORTANTE: Ejecuta primero supabase-schema-v2.sql antes de este script

-- ============================================
-- PASO 1: Verificar que existen las nuevas tablas
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'game_catalog') THEN
    RAISE EXCEPTION 'La tabla game_catalog no existe. Ejecuta supabase-schema-v2.sql primero.';
  END IF;

  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_games') THEN
    RAISE EXCEPTION 'La tabla user_games no existe. Ejecuta supabase-schema-v2.sql primero.';
  END IF;
END $$;

-- ============================================
-- PASO 2: Migrar juegos únicos a game_catalog
-- ============================================
-- Inserta juegos únicos de la tabla games al catálogo
-- Nota: Como no teníamos rawg_id antes, usamos un valor temporal basado en el hash del título

INSERT INTO game_catalog (rawg_id, title, slug, image_url, released_date, platforms, created_at, updated_at)
SELECT DISTINCT ON (LOWER(TRIM(title)))
  -- Genera un rawg_id temporal basado en el hash del título
  -- Estos IDs serán reemplazados cuando el usuario busque el juego en RAWG
  (hashtext(LOWER(TRIM(title))) & 2147483647)::INTEGER as rawg_id,
  TRIM(title) as title,
  LOWER(REGEXP_REPLACE(TRIM(title), '[^a-zA-Z0-9]+', '-', 'g')) as slug,
  NULL as image_url, -- No teníamos imágenes antes
  NULL as released_date, -- No teníamos fecha antes
  ARRAY[platform]::TEXT[] as platforms, -- Convertir plataforma a array
  created_at,
  updated_at
FROM games
WHERE title IS NOT NULL AND TRIM(title) != ''
ORDER BY LOWER(TRIM(title)), created_at DESC
ON CONFLICT (rawg_id) DO NOTHING;

-- ============================================
-- PASO 3: Migrar colección de usuarios a user_games
-- ============================================
-- Inserta las entradas de usuarios con referencia al catálogo

INSERT INTO user_games (
  user_id,
  game_catalog_id,
  price,
  store,
  platform,
  condition,
  description,
  platinum,
  purchased_date,
  created_at,
  updated_at
)
SELECT
  g.user_id,
  gc.id as game_catalog_id,
  g.price,
  g.store,
  g.platform,
  g.condition,
  g.description,
  g.platinum,
  NULL as purchased_date, -- No teníamos este campo antes
  g.created_at,
  g.updated_at
FROM games g
INNER JOIN game_catalog gc
  ON LOWER(TRIM(gc.title)) = LOWER(TRIM(g.title))
WHERE g.title IS NOT NULL AND TRIM(g.title) != ''
ON CONFLICT (user_id, game_catalog_id) DO NOTHING;

-- ============================================
-- PASO 4: Verificar migración
-- ============================================
-- Muestra resumen de la migración

DO $$
DECLARE
  old_games_count INTEGER;
  catalog_count INTEGER;
  user_games_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_games_count FROM games;
  SELECT COUNT(*) INTO catalog_count FROM game_catalog;
  SELECT COUNT(*) INTO user_games_count FROM user_games;

  RAISE NOTICE '=== RESUMEN DE MIGRACIÓN ===';
  RAISE NOTICE 'Juegos en tabla antigua (games): %', old_games_count;
  RAISE NOTICE 'Juegos únicos en catálogo (game_catalog): %', catalog_count;
  RAISE NOTICE 'Entradas de usuarios (user_games): %', user_games_count;
  RAISE NOTICE '===========================';

  IF user_games_count < old_games_count THEN
    RAISE WARNING 'Algunos juegos no se migraron. Revisa los datos.';
  END IF;
END $$;

-- ============================================
-- PASO 5: Eliminar tabla antigua (CUIDADO!)
-- ============================================
-- DESCOMENTA las siguientes líneas SOLO después de verificar
-- que la migración fue exitosa

-- DROP TABLE IF EXISTS games CASCADE;

-- RAISE NOTICE 'Tabla "games" eliminada exitosamente';

-- ============================================
-- NOTAS POST-MIGRACIÓN
-- ============================================
/*
IMPORTANTE:
1. Los juegos migrados tienen rawg_id temporales generados por hash
2. Las imágenes serán NULL hasta que se busquen en RAWG
3. Cuando un usuario edite un juego, podrá buscar el juego en RAWG
   para obtener la imagen y metadata correcta
4. Los juegos compartidos entre usuarios ahora están en game_catalog
   (un solo registro en el catálogo, múltiples referencias en user_games)

RECOMENDACIÓN:
- Verifica manualmente algunos registros en ambas tablas
- Compara con la tabla games antigua
- Solo elimina la tabla games cuando estés 100% seguro
*/

-- Consulta para verificar juegos migrados:
-- SELECT * FROM user_games_with_catalog LIMIT 10;

-- Consulta para ver juegos sin imagen:
-- SELECT * FROM game_catalog WHERE image_url IS NULL LIMIT 10;
