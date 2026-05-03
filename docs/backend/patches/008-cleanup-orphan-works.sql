-- ============================================================
-- Patch 008 — Cleanup retroactivo de user_works huérfanos
-- ============================================================
-- El patch 006 creó el trigger trg_user_games_cleanup_orphan_works
-- (AFTER DELETE on user_games) que borra el user_works cuando se
-- elimina su última copia. Pero el trigger solo aplica a borrados
-- futuros — los user_works que quedaron huérfanos por borrados
-- ANTERIORES al patch 006 siguen presentes.
--
-- Este patch hace una pasada única limpiando los huérfanos detectados
-- en el health-check post-refactor.
-- ============================================================

DELETE FROM user_works
WHERE NOT EXISTS (
  SELECT 1 FROM user_games WHERE work_id = user_works.id
);
