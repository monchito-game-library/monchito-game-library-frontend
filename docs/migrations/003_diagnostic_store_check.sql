-- ============================================================
-- Diagnóstico: juegos con tienda no reconocida o sin tienda
-- Ejecuta esto PRIMERO para ver el estado actual antes de migrar
-- ============================================================

-- 1. Juegos cuyo store NO existe en la tabla stores
--    (código antiguo, valor nulo o mal importado)
SELECT
  ug.id,
  gc.title,
  ug.store        AS store_actual,
  ug.format       AS format_actual
FROM user_games ug
JOIN game_catalog gc ON gc.id = ug.game_catalog_id
WHERE ug.store IS NULL
   OR ug.store NOT IN (SELECT code FROM stores);

-- 2. Juegos con tienda reconocida pero sin formato aún
--    (pendientes de que se ejecute la migración de backfill)
SELECT
  ug.id,
  gc.title,
  ug.store,
  s.format_hint
FROM user_games ug
JOIN game_catalog gc ON gc.id = ug.game_catalog_id
JOIN stores s        ON s.code = ug.store
WHERE ug.format IS NULL
  AND s.format_hint IS NOT NULL;

-- 3. Juegos con tienda reconocida pero la tienda no tiene hint
--    (formato tendrá que ponerse a mano)
SELECT
  ug.id,
  gc.title,
  ug.store,
  ug.format
FROM user_games ug
JOIN game_catalog gc ON gc.id = ug.game_catalog_id
JOIN stores s        ON s.code = ug.store
WHERE s.format_hint IS NULL;
